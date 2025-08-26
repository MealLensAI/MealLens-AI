-- ================================================
-- Update Detection History RPC Function for Correct Schema
-- ================================================

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.add_detection_history(uuid, text, text, text, text, text, text, text, text, text);

-- Create new function that matches the correct detection_history table schema
CREATE OR REPLACE FUNCTION public.add_detection_history(
    p_user_id UUID,
    p_recipe_type TEXT,
    p_suggestion TEXT DEFAULT NULL,
    p_instructions TEXT DEFAULT NULL,
    p_ingredients TEXT DEFAULT NULL,
    p_detected_foods TEXT DEFAULT NULL,
    p_youtube TEXT DEFAULT NULL,
    p_google TEXT DEFAULT NULL,
    p_resources TEXT DEFAULT NULL,
    p_analysis_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_id UUID;
BEGIN
    INSERT INTO public.detection_history (
        user_id, recipe_type, suggestion, instructions, ingredients,
        detected_foods, youtube, google, resources, analysis_id
    )
    VALUES (
        p_user_id, p_recipe_type, p_suggestion, p_instructions, p_ingredients,
        p_detected_foods, p_youtube, p_google, p_resources, p_analysis_id
    )
    RETURNING id INTO new_id;
    
    RETURN jsonb_build_object(
        'status', 'success',
        'id', new_id,
        'user_id', p_user_id
    );
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'status', 'error',
        'message', SQLERRM,
        'detail', SQLSTATE
    );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.add_detection_history(uuid, text, text, text, text, text, text, text, text, text) TO anon, authenticated;

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.get_user_detection_history(uuid);

-- Create function to get user detection history
CREATE OR REPLACE FUNCTION public.get_user_detection_history(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    history_records JSONB;
BEGIN
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', dh.id,
            'created_at', dh.created_at,
            'recipe_type', dh.recipe_type,
            'suggestion', dh.suggestion,
            'instructions', dh.instructions,
            'ingredients', dh.ingredients,
            'detected_foods', dh.detected_foods,
            'analysis_id', dh.analysis_id,
            'youtube', dh.youtube,
            'google', dh.google,
            'resources', dh.resources,
            'user_id', dh.user_id
        )
    ) INTO history_records
    FROM public.detection_history dh
    WHERE dh.user_id = p_user_id
    ORDER BY dh.created_at DESC;
    
    IF history_records IS NULL THEN
        RETURN jsonb_build_object('status', 'success', 'data', '[]'::jsonb);
    ELSE
        RETURN jsonb_build_object('status', 'success', 'data', history_records);
    END IF;
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'status', 'error',
        'message', SQLERRM,
        'detail', SQLSTATE
    );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_user_detection_history(uuid) TO anon, authenticated;

-- Drop existing update function if it exists
DROP FUNCTION IF EXISTS public.update_detection_history(text, uuid, jsonb);

-- Create function to update detection history
CREATE OR REPLACE FUNCTION public.update_detection_history(
    p_analysis_id TEXT,
    p_user_id UUID,
    p_updates JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE public.detection_history 
    SET 
        suggestion = COALESCE(p_updates->>'suggestion', suggestion),
        instructions = COALESCE(p_updates->>'instructions', instructions),
        ingredients = COALESCE(p_updates->>'ingredients', ingredients),
        detected_foods = COALESCE(p_updates->>'detected_foods', detected_foods),
        youtube = COALESCE(p_updates->>'youtube', youtube),
        google = COALESCE(p_updates->>'google', google),
        resources = COALESCE(p_updates->>'resources', resources)
    WHERE analysis_id = p_analysis_id AND user_id = p_user_id;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    IF updated_count > 0 THEN
        RETURN jsonb_build_object('status', 'success', 'updated_count', updated_count);
    ELSE
        RETURN jsonb_build_object('status', 'error', 'message', 'No records updated - analysis_id or user_id may not match');
    END IF;
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'status', 'error',
        'message', SQLERRM,
        'detail', SQLSTATE
    );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.update_detection_history(text, uuid, jsonb) TO anon, authenticated; 