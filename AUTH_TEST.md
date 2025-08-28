# Authentication Debug Test Guide

## Issue: Users getting logged out after some time

### Root Cause Analysis:
1. **Supabase JWT tokens expire after 1 hour by default**
2. **Token refresh mechanism might not be working properly**
3. **No periodic token refresh was implemented**

### Solutions Implemented:

#### 1. Enhanced Logging
- Added detailed console logging to track authentication flow
- Backend logs now show token verification and refresh attempts
- Frontend logs show when tokens are validated, refreshed, or fail

#### 2. Periodic Token Refresh
- Added automatic token refresh every 45 minutes (before 1-hour expiration)
- Prevents token expiration while user is actively using the app

#### 3. User Activity Detection
- Monitors user activity (mouse, keyboard, touch, scroll)
- Refreshes token when user becomes active after 30+ minutes of inactivity
- Ensures fresh token for active users

#### 4. Improved Error Handling
- Better error messages and logging
- Graceful fallback when refresh fails
- No immediate logout on temporary network issues

### Testing Steps:

1. **Login and check console logs:**
   ```
   Open browser console and look for:
   [AUTH] Starting refreshAuth...
   [AUTH] Token validation successful
   ```

2. **Wait and monitor:**
   ```
   Every 45 minutes, you should see:
   [AUTH] Periodic token refresh check...
   [AUTH] Periodic token refresh successful
   ```

3. **Test inactivity:**
   ```
   Leave the app idle for 30+ minutes, then interact
   Should see: [AUTH] User became active after inactivity, checking token...
   ```

4. **Check backend logs:**
   ```
   Backend should show:
   [AUTH] Verifying Supabase token: ...
   [AUTH] Token verification successful for user: ...
   ```

### Expected Behavior:
- Users should stay logged in indefinitely while actively using the app
- Tokens refresh automatically in the background
- No more unexpected logouts after 1 hour
- Better error messages if authentication issues occur

### If Issues Persist:
1. Check browser console for authentication logs
2. Check backend logs for token verification errors
3. Verify Supabase configuration and keys
4. Test with a fresh login session 