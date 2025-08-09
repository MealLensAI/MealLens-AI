import base64
import io
from PIL import Image
import os

def compress_image(image_data: str, max_size: tuple = (800, 600), quality: int = 85) -> str:
    """
    Compress an image from base64 string and return compressed base64 string.
    
    Args:
        image_data: Base64 encoded image string
        max_size: Maximum dimensions (width, height)
        quality: JPEG quality (1-100)
    
    Returns:
        Compressed base64 encoded image string
    """
    try:
        # Remove data URL prefix if present
        if image_data.startswith('data:image'):
            image_data = image_data.split(',')[1]
        
        # Decode base64
        image_bytes = base64.b64decode(image_data)
        
        # Open image with PIL
        image = Image.open(io.BytesIO(image_bytes))
        
        # Convert to RGB if necessary (for JPEG compression)
        if image.mode in ('RGBA', 'LA', 'P'):
            # Create white background
            background = Image.new('RGB', image.size, (255, 255, 255))
            if image.mode == 'P':
                image = image.convert('RGBA')
            background.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
            image = background
        
        # Resize if larger than max_size
        if image.size[0] > max_size[0] or image.size[1] > max_size[1]:
            image.thumbnail(max_size, Image.Resampling.LANCZOS)
        
        # Compress and convert to base64
        buffer = io.BytesIO()
        image.save(buffer, format='JPEG', quality=quality, optimize=True)
        compressed_bytes = buffer.getvalue()
        
        # Encode back to base64
        compressed_base64 = base64.b64encode(compressed_bytes).decode('utf-8')
        
        return compressed_base64
        
    except Exception as e:
        print(f"Error compressing image: {e}")
        return image_data  # Return original if compression fails

def validate_image_data(image_data: str) -> bool:
    """
    Validate if the image data is a valid base64 encoded image.
    
    Args:
        image_data: Base64 encoded image string
    
    Returns:
        True if valid, False otherwise
    """
    try:
        # Remove data URL prefix if present
        if image_data.startswith('data:image'):
            image_data = image_data.split(',')[1]
        
        # Try to decode base64
        image_bytes = base64.b64decode(image_data)
        
        # Try to open with PIL to validate it's an image
        image = Image.open(io.BytesIO(image_bytes))
        image.verify()  # Verify the image
        
        return True
    except Exception as e:
        print(f"Invalid image data: {e}")
        return False

def get_image_info(image_data: str) -> dict:
    """
    Get information about an image from base64 data.
    
    Args:
        image_data: Base64 encoded image string
    
    Returns:
        Dictionary with image information
    """
    try:
        # Remove data URL prefix if present
        if image_data.startswith('data:image'):
            image_data = image_data.split(',')[1]
        
        # Decode base64
        image_bytes = base64.b64decode(image_data)
        
        # Open image with PIL
        image = Image.open(io.BytesIO(image_bytes))
        
        return {
            'format': image.format,
            'mode': image.mode,
            'size': image.size,
            'original_size_bytes': len(image_bytes),
            'original_size_kb': len(image_bytes) / 1024
        }
    except Exception as e:
        print(f"Error getting image info: {e}")
        return {} 