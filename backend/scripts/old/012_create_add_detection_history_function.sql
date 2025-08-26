-- ================================================
-- Add Detection History RPC Function
-- ================================================

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.add_detection_history(uuid, text, text, text, text, text, text, text, text, text);

-- Add detection history record
CREATE OR REPLACE FUNCTION public.add_detection_history(
    p_user_id UUID,
    p_recipe_type TEXT,
    p_suggestion TEXT DEFAULT NULL,
    p_instructions TEXT DEFAULT NULL,
    p_ingredients TEXT DEFAULT NULL,
    p_detected_foods TEXT DEFAULT NULL,
    p_analysis_id TEXT DEFAULT NULL,
    p_youtube TEXT DEFAULT NULL,
    p_google TEXT DEFAULT NULL,
    p_resources TEXT DEFAULT NULL
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
        detected_foods, analysis_id, youtube, google, resources
    )
    VALUES (
        p_user_id, p_recipe_type, p_suggestion, p_instructions, p_ingredients,
        p_detected_foods, p_analysis_id, p_youtube, p_google, p_resources
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