# =============================================================================
# FOOD DETECTION ROUTES
# =============================================================================

from flask import Blueprint, request, jsonify, current_app
import os
import uuid # For generating unique IDs
import json # For handling JSON strings
from marshmallow import Schema, fields, ValidationError

# Import utilities and services
from utils.file_utils import allowed_file
from utils.image_utils import compress_image, validate_image_data
from werkzeug.utils import secure_filename

# TEMPORARY TESTING MODE: Disable all usage limits
TESTING_MODE = True  # Set to False to re-enable usage limits

food_detection_bp = Blueprint('food_detection', __name__)

class DetectionHistorySchema(Schema):
    recipe_type = fields.Str(required=True)
    suggestion = fields.Str(allow_none=True)
    instructions = fields.Str(allow_none=True)
    ingredients = fields.Str(allow_none=True)
    detected_foods = fields.Str(allow_none=True)
    analysis_id = fields.Str(allow_none=True, load_default=None)
    youtube = fields.Str(allow_none=True)
    google = fields.Str(allow_none=True)
    resources = fields.Str(allow_none=True)
    input_data = fields.Str(allow_none=True)
    image_data = fields.Str(allow_none=True)  # Base64 encoded compressed image

def check_usage_limit(user_id: str, feature_name: str) -> tuple[bool, dict]:
    """Check if user can use a specific feature based on their subscription."""
    try:
        result = current_app.supabase_service.supabase.rpc('can_use_feature', {
            'p_user_id': user_id,
            'p_feature_name': feature_name
        }).execute()
        
        if result.data:
            return True, result.data
        else:
            return False, {'message': 'Usage check failed'}
    except Exception as e:
        print(f"Error checking usage limit: {e}")
        return False, {'message': 'Error checking usage limit'}

def record_usage(user_id: str, feature_name: str, count: int = 1) -> bool:
    """Record usage of a feature."""
    try:
        result = current_app.supabase_service.supabase.rpc('record_usage', {
            'p_user_id': user_id,
            'p_feature_name': feature_name,
            'p_count': count
        }).execute()
        return True
    except Exception as e:
        print(f"Error recording usage: {e}")
        return False

@food_detection_bp.route('/process', methods=['POST'])
def process_food_input():
  """
  Receives initial food input (image or ingredient list) and AI-detected
  ingredients/suggestions from the frontend. Stores this data in detection_history.
  """
  auth_service = current_app.auth_service
  supabase_service = current_app.supabase_service
  user_id, auth_type = auth_service.get_supabase_user_id_from_token(request.headers.get('Authorization'))
  
  if not user_id:
      return jsonify({'status': 'error', 'message': 'Authentication required.'}), 401

  # Check usage limit for ingredient detection (disabled during testing)
  if not TESTING_MODE:
      can_use, usage_info = check_usage_limit(user_id, 'ingredient_detection')
      if not can_use:
          return jsonify({
              'status': 'error', 
              'message': usage_info.get('message', 'Usage limit exceeded for this month'),
              'usage_info': usage_info
          }), 403
  else:
      print(f"[DEBUG] TESTING MODE: Skipping usage limit check for user {user_id}")
      usage_info = {'message': 'Testing mode - no limits enforced'}

  input_type = request.form.get('image_or_ingredient_list')
  detected_ingredients_str = request.form.get('detected_ingredients')
  food_suggestions_str = request.form.get('food_suggestions')

  if not detected_ingredients_str or not food_suggestions_str:
      return jsonify({'status': 'error', 'message': 'Detected ingredients and food suggestions are required.'}), 400

  try:
      detected_ingredients = json.loads(detected_ingredients_str)
      food_suggestions = json.loads(food_suggestions_str)
  except json.JSONDecodeError:
      return jsonify({'status': 'error', 'message': 'Invalid JSON for detected_ingredients or food_suggestions.'}), 400

  analysis_id = str(uuid.uuid4()) # Generate a unique analysis ID for tracking
  input_data_value = None
  
  if input_type == 'ingredient_list':
      ingredients_text = request.form.get('ingredient_list')
      if not ingredients_text:
          return jsonify({'status': 'error', 'message': 'Ingredient list is required.'}), 400
      input_data_value = ingredients_text
      print(f"Received ingredient list from user {user_id}: {ingredients_text}")

  elif input_type == 'image':
      if 'image' not in request.files:
          return jsonify({'status': 'error', 'message': 'No image uploaded.'}), 400
      file = request.files['image']
      if file and allowed_file(file.filename): # allowed_file now only checks extension
          # Upload image to Supabase Storage
          filename = secure_filename(file.filename)
          # Use a unique path to avoid overwrites, e.g., user_id/analysis_id/filename
          storage_path = f"detection_images/{user_id}/{analysis_id}/{filename}"
          image_url, upload_error = supabase_service.upload_file(file, 'detection_images', storage_path)
          if upload_error:
              print(f"Error uploading image to Supabase Storage: {upload_error}")
              return jsonify({'status': 'error', 'message': f'Failed to upload image: {upload_error}'}), 500
          input_data_value = image_url
          print(f'Image uploaded to Supabase Storage: {image_url} for user {user_id}')
      else:
          return jsonify({'status': 'error', 'message': 'Invalid file type.'}), 400
  else:
      return jsonify({'status': 'error', 'message': 'Invalid input type.'}), 400

  # Store the initial detection event in detection_history
  success, error = supabase_service.save_detection_history(
      user_id=user_id,
      recipe_type='ingredient_detection',
      suggestion=food_suggestions[0] if food_suggestions else None,
      detected_foods=json.dumps(detected_ingredients), # Store as JSON string
      analysis_id=analysis_id,
      input_data=input_data_value
  )
  if not success:
      print(f"Error saving initial detection history: {error}")
      return jsonify({'status': 'error', 'message': 'Failed to save detection history.'}), 500

  # Record usage for ingredient detection
  record_usage(user_id, 'ingredient_detection', 1)

  return jsonify({
      'status': 'success',
      'analysis_id': analysis_id,
      'message': 'Initial detection data received and saved.',
      'usage_info': usage_info
  }), 200

@food_detection_bp.route('/instructions', methods=['POST'])
def update_instructions():
  """
  Receives cooking instructions and ingredients for a chosen recipe suggestion
  from the frontend and updates the corresponding detection history entry.
  """
  auth_service = current_app.auth_service
  supabase_service = current_app.supabase_service
  user_id, auth_type = auth_service.get_supabase_user_id_from_token(request.headers.get('Authorization'))

  if not user_id:
      return jsonify({'status': 'error', 'message': 'Authentication required.'}), 401

  data = request.get_json()
  food_analysis_id = data.get('food_analysis_id')
  food_choice_index = data.get('food_choice_index') # This is the chosen suggestion text
  instructions_text = data.get('instructions_text')
  recipe_ingredients_str = data.get('recipe_ingredients') # Expected as JSON string

  if not food_analysis_id or not instructions_text or not recipe_ingredients_str:
      return jsonify({'status': 'error', 'message': 'Missing required data for instructions update.'}), 400

  updates = {
      'suggestion': food_choice_index,
      'instructions': instructions_text,
      'ingredients': recipe_ingredients_str # Store as JSON string
  }

  success, error = supabase_service.update_detection_history(
      analysis_id=food_analysis_id,
      user_id=user_id,
      updates=updates
  )
  if not success:
      print(f"Error updating detection history with instructions: {error}")
      return jsonify({'status': 'error', 'message': f'Failed to update instructions: {error}'}), 500

  return jsonify({'status': 'success', 'message': 'Instructions updated successfully.'}), 200

@food_detection_bp.route('/resources', methods=['POST'])
def update_resources():
  """
  Receives YouTube, Google, and combined resources links from the frontend
  and updates the corresponding detection history entry.
  """
  auth_service = current_app.auth_service
  supabase_service = current_app.supabase_service
  user_id, auth_type = auth_service.get_supabase_user_id_from_token(request.headers.get('Authorization'))

  if not user_id:
      return jsonify({'status': 'error', 'message': 'Authentication required.'}), 401

  data = request.get_json()
  food_analysis_id = data.get('food_analysis_id')
  youtube_link = data.get('youtube_link')
  google_link = data.get('google_link')
  resources_link = data.get('resources_link') # Combined HTML string

  if not food_analysis_id:
      return jsonify({'status': 'error', 'message': 'Missing food_analysis_id for resources update.'}), 400

  updates = {
      'youtube': youtube_link,
      'google': google_link,
      'resources': resources_link
  }

  success, error = supabase_service.update_detection_history(
      analysis_id=food_analysis_id,
      user_id=user_id,
      updates=updates
  )
  if not success:
      print(f"Error updating detection history with resources: {error}")
      return jsonify({'status': 'error', 'message': f'Failed to update resources: {error}'}), 500

  return jsonify({'status': 'success', 'message': 'Resources updated successfully.'}), 200

@food_detection_bp.route('/food_detect', methods=['POST'])
def food_detect():
  """
  Receives an image, AI-detected foods, and instructions from the frontend.
  Stores this data in detection_history.
  """
  auth_service = current_app.auth_service
  supabase_service = current_app.supabase_service
  user_id, auth_type = auth_service.get_supabase_user_id_from_token(request.headers.get('Authorization'))
  
  if not user_id:
      return jsonify({'status': 'error', 'message': 'Authentication required.'}), 401

  # Check usage limit for food detection (disabled during testing)
  if not TESTING_MODE:
      can_use, usage_info = check_usage_limit(user_id, 'food_detection')
      if not can_use:
          return jsonify({
              'status': 'error', 
              'message': usage_info.get('message', 'Usage limit exceeded for this month'),
              'usage_info': usage_info
          }), 403
  else:
      print(f"[DEBUG] TESTING MODE: Skipping usage limit check for user {user_id}")
      usage_info = {'message': 'Testing mode - no limits enforced'}

  if 'image' not in request.files:
      return jsonify({'status': 'error', 'message': 'No image uploaded.'}), 400
  file = request.files['image']

  detected_foods_str = request.form.get('detected_foods')
  instructions_text = request.form.get('instructions_text')

  if not detected_foods_str or not instructions_text:
      return jsonify({'status': 'error', 'message': 'Detected foods and instructions are required.'}), 400

  try:
      detected_foods = json.loads(detected_foods_str)
  except json.JSONDecodeError:
      return jsonify({'status': 'error', 'message': 'Invalid JSON for detected_foods.'}), 400

  analysis_id = str(uuid.uuid4()) # Generate a unique analysis ID

  if file and allowed_file(file.filename):
      filename = secure_filename(file.filename)
      # Upload image to Supabase Storage
      storage_path = f"detection_images/{user_id}/{analysis_id}/{filename}"
      image_url, upload_error = supabase_service.upload_file(file, 'detection_images', storage_path)
      if upload_error:
          print(f"Error uploading image to Supabase Storage: {upload_error}")
          return jsonify({'status': 'error', 'message': f'Failed to upload image: {upload_error}'}), 500
      input_data_value = image_url
      print(f'Image uploaded to Supabase Storage: {image_url} for user {user_id}')
  else:
      return jsonify({'status': 'error', 'message': 'Invalid file type.'}), 400

  # Store this complete detection event in detection_history
  success, error = supabase_service.save_detection_history(
      user_id=user_id,
      recipe_type='food_detection',
      detected_foods=json.dumps(detected_foods), # Store as JSON string
      instructions=instructions_text,
      input_data=input_data_value
  )
  if not success:
      print(f"Error saving food detection history: {error}")
      return jsonify({'status': 'error', 'message': 'Failed to save food detection history.'}), 500

  # Record usage for food detection
  record_usage(user_id, 'food_detection', 1)

  return jsonify({
      'status': 'success',
      'analysis_id': analysis_id,
      'usage_info': usage_info,
      'message': 'Food detection data received and saved.'
  }), 200

@food_detection_bp.route('/food_detect_resources', methods=['POST'])
def update_food_detect_resources():
  """
  Receives YouTube, Google, and combined resources links for detected food items
  from the frontend and updates the corresponding detection history entry.
  """
  auth_service = current_app.auth_service
  supabase_service = current_app.supabase_service
  user_id, auth_type = auth_service.get_supabase_user_id_from_token(request.headers.get('Authorization'))

  if not user_id:
      return jsonify({'status': 'error', 'message': 'Authentication required.'}), 401

  data = request.get_json()
  food_analysis_id = data.get('food_analysis_id')
  youtube_link = data.get('youtube_link')
  google_link = data.get('google_link')
  resources_link = data.get('resources_link') # Combined HTML string

  if not food_analysis_id:
      return jsonify({'status': 'error', 'message': 'Missing food_analysis_id for resources update.'}), 400

  updates = {
      'youtube': youtube_link,
      'google': google_link,
      'resources': resources_link
  }

  success, error = supabase_service.update_detection_history(
      analysis_id=food_analysis_id,
      user_id=user_id,
      updates=updates
  )
  if not success:
      print(f"Error updating food detection history with resources: {error}")
      return jsonify({'status': 'error', 'message': f'Failed to update resources: {error}'}), 500

  return jsonify({'status': 'success', 'message': 'Food detection resources updated successfully.'}), 200

@food_detection_bp.route('/update_resources', methods=['POST'])
def update_resources_by_record():
  """
  Updates resources for a detection history record by record ID.
  """
  auth_service = current_app.auth_service
  supabase_service = current_app.supabase_service
  user_id, auth_type = auth_service.get_supabase_user_id_from_token(request.headers.get('Authorization'))

  if not user_id:
      return jsonify({'status': 'error', 'message': 'Authentication required.'}), 401

  data = request.get_json()
  record_id = data.get('record_id')
  youtube = data.get('youtube')
  google = data.get('google')
  resources = data.get('resources')

  if not record_id:
      return jsonify({'status': 'error', 'message': 'Missing record_id for resources update.'}), 400

  updates = {
      'youtube': youtube,
      'google': google,
      'resources': resources
  }

  # Update by record ID instead of analysis_id
  try:
      result = supabase_service.supabase.table('detection_history').update(updates).eq('id', record_id).eq('user_id', user_id).execute()
      
      if result.data:
          print(f"[DEBUG] Successfully updated detection history with resources: {result.data}")
          return jsonify({'status': 'success', 'message': 'Resources updated successfully.'}), 200
      else:
          error = "No records updated - record_id or user_id may not match"
          print(f"[ERROR] Failed to update detection history: {error}")
          return jsonify({'status': 'error', 'message': f'Failed to update resources: {error}'}), 500
  except Exception as e:
      error_msg = str(e)
      print(f"[ERROR] Exception in update_resources_by_record: {error_msg}")
      return jsonify({'status': 'error', 'message': f'Failed to update resources: {error_msg}'}), 500

@food_detection_bp.route('/share_recipe', methods=['POST'])
def share_recipe():
  """
  Receives complete recipe data from the frontend and saves it to the
  'shared_recipes' table.
  """
  auth_service = current_app.auth_service
  supabase_service = current_app.supabase_service
  user_id, auth_type = auth_service.get_supabase_user_id_from_token(request.headers.get('Authorization'))

  if not user_id:
      return jsonify({'status': 'error', 'message': 'Authentication required to share recipes.'}), 401

  data = request.get_json()
  if not data:
      return jsonify({'status': 'error', 'message': 'Recipe data is required.'}), 400

  # Extract data for shared_recipes table
  recipe_type = data.get('recipe_type') # 'ingredient_detection' or 'food_detection'
  suggestion = data.get('suggestion')
  instructions = data.get('instructions')
  ingredients = data.get('ingredients') # JSON string of array
  detected_foods = data.get('detected_foods') # JSON string of array
  analysis_id = data.get('analysis_id')
  youtube = data.get('youtube')
  google = data.get('google')
  resources = data.get('resources') # Combined HTML string

  if not recipe_type or not instructions:
      return jsonify({'status': 'error', 'message': 'Recipe type and instructions are required to share.'}), 400

  success, error = supabase_service.save_shared_recipe(
      user_id=user_id,
      recipe_type=recipe_type,
      suggestion=suggestion,
      instructions=instructions,
      ingredients=ingredients,
      detected_foods=detected_foods,
      analysis_id=analysis_id,
      youtube=youtube,
      google=google,
      resources=resources
  )

  if success:
      return jsonify({'status': 'success', 'message': 'Recipe shared successfully.'}), 201
  else:
      print(f"Error saving shared recipe: {error}")
      return jsonify({'status': 'error', 'message': 'Failed to share recipe.'}), 500

@food_detection_bp.route('/detection_history', methods=['POST'])
def create_detection_history():
    """
    Receives detection data from the frontend and inserts it into detection_history via Supabase.
    Allows all expected fields using Marshmallow schema validation, including shared_recipes fields.
    """
    auth_service = current_app.auth_service
    supabase_service = current_app.supabase_service
    user_id, auth_type = auth_service.get_supabase_user_id_from_token(request.headers.get('Authorization'))

    if not user_id:
        return jsonify({'status': 'error', 'message': 'Authentication required.'}), 401

    # Accept both JSON and form data
    if request.is_json:
        data = request.get_json()
    else:
        data = request.form.to_dict()

    print("Received payload for detection_history:", data)  # Debug print

    schema = DetectionHistorySchema()
    try:
        validated = schema.load(data)
    except ValidationError as err:
        return jsonify({'status': 'error', 'message': err.messages}), 400

    # Stringify detected_foods and ingredients to match Supabase text columns
    if isinstance(validated.get('detected_foods'), list):
        validated['detected_foods'] = json.dumps(validated['detected_foods'])
    if isinstance(validated.get('ingredients'), list):
        validated['ingredients'] = json.dumps(validated['ingredients'])

    # Handle image compression if image_data is provided
    image_data = validated.get('image_data')
    if image_data:
        if validate_image_data(image_data):
            print("Compressing image data...")
            compressed_image = compress_image(image_data, max_size=(800, 600), quality=85)
            validated['image_data'] = compressed_image
            print(f"Image compressed successfully. Original size: {len(image_data)} chars, Compressed: {len(compressed_image)} chars")
        else:
            print("Invalid image data provided, removing from payload")
            validated['image_data'] = None

    print("Payload being passed to save_detection_history:", {
        'user_id': user_id,
        'recipe_type': validated.get('recipe_type'),
        'suggestion': validated.get('suggestion'),
        'instructions': validated.get('instructions'),
        'ingredients': validated.get('ingredients'),
        'detected_foods': validated.get('detected_foods'),
        'analysis_id': validated.get('analysis_id'),
        'youtube': validated.get('youtube'),
        'google': validated.get('google'),
        'resources': validated.get('resources'),
        'input_data': validated.get('input_data'),
        'image_data': 'COMPRESSED_IMAGE' if validated.get('image_data') else None
    })

    # Insert all validated fields, including shared_recipes fields
    success, error = supabase_service.save_detection_history(
        user_id=user_id,
        recipe_type=validated.get('recipe_type'),
        suggestion=validated.get('suggestion'),
        instructions=validated.get('instructions'),
        ingredients=validated.get('ingredients'),
        detected_foods=validated.get('detected_foods'),
        analysis_id=validated.get('analysis_id'),
        youtube=validated.get('youtube'),
        google=validated.get('google'),
        resources=validated.get('resources'),
        input_data=validated.get('input_data'),
        image_data=validated.get('image_data')
    )
    if not success:
        print(f"[ERROR] Failed to save detection history: {error}")
        return jsonify({'status': 'error', 'message': f'Failed to save detection history: {error}'}), 500

    return jsonify({'status': 'success', 'message': 'Detection history saved.'}), 201

@food_detection_bp.route('/detection_history', methods=['GET'])
def get_detection_history():
    """
    Retrieves a user's food detection history from the database. Requires authentication.
    """
    try:
        auth_header = request.headers.get('Authorization')
        
        auth_service = current_app.auth_service
        user_id, auth_type = auth_service.get_supabase_user_id_from_token(auth_header)
        
        if not user_id:
            current_app.logger.warning("Authentication failed: No user_id extracted")
            return jsonify({'status': 'error', 'message': 'Authentication required.'}), 401

        current_app.logger.info(f"Fetching detection history for user: {user_id}")
        
        supabase_service = current_app.supabase_service
        detection_history, error = supabase_service.get_detection_history(user_id)
        
        if detection_history is not None:
            record_count = len(detection_history) if detection_history else 0
            current_app.logger.info(f"Successfully retrieved {record_count} records for user {user_id}")
            
            response_data = {
                'status': 'success', 
                'detection_history': detection_history
            }
            
            return jsonify(response_data), 200
        else:
            current_app.logger.error(f"Database error for user {user_id}: {error}")
            return jsonify({'status': 'error', 'message': f'Failed to retrieve detection history: {error}'}), 500
            
    except Exception as e:
        current_app.logger.error(f"Unexpected error in get_detection_history: {str(e)}")
        return jsonify({'status': 'error', 'message': 'Internal server error'}), 500

@food_detection_bp.route('/detection_history/<record_id>', methods=['DELETE'])
def delete_detection_history(record_id):
    """
    Deletes a specific detection history record. Requires authentication.
    """
    try:
        auth_header = request.headers.get('Authorization')
        
        auth_service = current_app.auth_service
        user_id, auth_type = auth_service.get_supabase_user_id_from_token(auth_header)
        
        if not user_id:
            current_app.logger.warning("Authentication failed: No user_id extracted")
            return jsonify({'status': 'error', 'message': 'Authentication required.'}), 401

        current_app.logger.info(f"Deleting detection history record {record_id} for user: {user_id}")
        
        supabase_service = current_app.supabase_service
        
        # First verify the record belongs to the user
        detection_history, error = supabase_service.get_detection_history(user_id)
        if error:
            current_app.logger.error(f"Database error for user {user_id}: {error}")
            return jsonify({'status': 'error', 'message': f'Failed to verify record ownership: {error}'}), 500
        
        # Check if record exists and belongs to user
        record_exists = False
        if detection_history:
            for record in detection_history:
                if str(record.get('id')) == str(record_id):
                    record_exists = True
                    break
        
        if not record_exists:
            current_app.logger.warning(f"Record {record_id} not found or doesn't belong to user {user_id}")
            return jsonify({'status': 'error', 'message': 'Record not found or access denied.'}), 404
        
        # Delete the record
        success, error = supabase_service.delete_detection_history(user_id, record_id)
        
        if success:
            current_app.logger.info(f"Successfully deleted detection history record {record_id} for user {user_id}")
            return jsonify({'status': 'success', 'message': 'Detection history record deleted successfully.'}), 200
        else:
            current_app.logger.error(f"Failed to delete detection history record {record_id} for user {user_id}: {error}")
            return jsonify({'status': 'error', 'message': f'Failed to delete record: {error}'}), 500
            
    except Exception as e:
        current_app.logger.error(f"Unexpected error in delete_detection_history: {str(e)}")
        return jsonify({'status': 'error', 'message': 'Internal server error'}), 500
