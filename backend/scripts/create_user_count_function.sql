-- Create function to get user count
CREATE OR REPLACE FUNCTION public.get_user_count()
RETURNS TABLE(user_count BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Count users from auth.users table
    RETURN QUERY
    SELECT COUNT(*)::BIGINT as user_count
    FROM auth.users
    WHERE auth.users.created_at IS NOT NULL;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_user_count() TO anon, authenticated;

-- Test the function
SELECT * FROM public.get_user_count(); 