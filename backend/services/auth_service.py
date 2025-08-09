import os
from supabase import Client # Import Client for type hinting
from typing import Optional, Tuple

class AuthService:
    """
    Manages user authentication using Supabase only.
    """
    def __init__(self, supabase_admin_client: Client):
        """
        Initializes the AuthService with Supabase admin client.

        Args:
            supabase_admin_client (Client): Supabase client initialized with service_role key.
        """
        self.supabase_admin = supabase_admin_client
        print("AuthService initialized with Supabase-only authentication.")

    def _verify_supabase_token(self, token: str) -> Tuple[Optional[str], str]:
        """
        Verifies a Supabase JWT token and returns the user ID.
        
        Args:
            token (str): Supabase JWT token
            
        Returns:
            Tuple[Optional[str], str]: (user_id, auth_type) or (None, '') if verification fails
        """
        try:
            # Use Supabase admin client to verify the token
            user = self.supabase_admin.auth.get_user(token)
            if user and user.user:
                # Return the user ID directly - profile fetch is optional
                return user.user.id, 'supabase'
            else:
                print("Invalid Supabase token")
                return None, ''
        except Exception as e:
            print(f"Error verifying Supabase token: {str(e)}")
            return None, ''

    def get_supabase_user_id_from_token(self, token: str) -> Tuple[Optional[str], str]:
        """
        Verifies a Supabase JWT token and returns the user ID.
        
        Args:
            token (str): Supabase JWT token (with or without 'Bearer ' prefix)
            
        Returns:
            Tuple[Optional[str], str]: (user_id, auth_type) or (None, '') if verification fails
        """
        if not token:
            print("No token provided")
            return None, ''
            
        # Remove 'Bearer ' prefix if present
        if token.startswith('Bearer '):
            token = token[7:]
            
        # Verify Supabase token
        try:
            user_id, auth_type = self._verify_supabase_token(token)
            if user_id:
                return user_id, auth_type
        except Exception as e:
            print(f"Supabase verification failed: {str(e)}")
            
        print("Token verification failed")
        return None, ''