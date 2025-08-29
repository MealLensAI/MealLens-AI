# Error Handling Guide - MealLens AI

## 🎯 **Professional Error Messages**

### **Mobile-Specific Error Handling**

#### **1. Network Errors**
- **Error**: `Network error. Please check your internet connection and try again.`
- **Cause**: Poor mobile network, airplane mode, or server unreachable
- **Solution**: Check internet connection, try again

#### **2. CORS Errors**
- **Error**: `Connection blocked. Please try again or contact support.`
- **Cause**: Mobile browser security restrictions
- **Solution**: Clear browser cache, try different browser

#### **3. Timeout Errors**
- **Error**: `Request timed out. Please try again.`
- **Cause**: Slow mobile network or server overload
- **Solution**: Wait and retry, check network speed

#### **4. Authentication Errors**
- **Error**: `Invalid email or password. Please check your credentials.`
- **Cause**: Wrong credentials or expired session
- **Solution**: Verify credentials, try logging in again

#### **5. Server Errors**
- **Error**: `Server error. Please try again in a few minutes.`
- **Cause**: Backend service issues
- **Solution**: Wait and retry, contact support if persistent

### **User-Friendly Error Messages**

#### **Login Errors**
```typescript
// Invalid credentials
"Invalid email or password. Please check your credentials."

// Network issues
"Network error. Please check your internet connection and try again."

// Server issues
"Server error. Please try again in a few minutes."

// General error
"Login failed. Please try again."
```

#### **Payment Errors**
```typescript
// Payment initialization failed
"Payment system is currently unavailable. Please try again later."

// Network issues during payment
"Payment connection error. Please check your internet and try again."

// Payment verification failed
"Payment verification failed. Please contact support if you were charged."
```

#### **Feature Access Errors**
```typescript
// Subscription required
"This feature requires a subscription. Please upgrade to continue."

// Usage limit reached
"You've reached your usage limit. Please upgrade to continue."

// Trial expired
"Your trial has expired. Please upgrade to continue using this feature."
```

### **Error Handling Best Practices**

#### **1. Always Provide Clear Action Items**
- ✅ "Please check your internet connection and try again."
- ❌ "An error occurred."

#### **2. Use Appropriate Error Levels**
- **Info**: "Please wait while we process your request."
- **Warning**: "Your session will expire soon. Please save your work."
- **Error**: "Login failed. Please check your credentials."

#### **3. Mobile-Specific Considerations**
- **Network**: Always mention internet connection for mobile users
- **Timeout**: Provide retry options for slow connections
- **Storage**: Warn about storage space for file uploads
- **Browser**: Suggest alternative browsers for compatibility issues

#### **4. Error Recovery**
- **Automatic Retry**: For network errors, retry automatically
- **Manual Retry**: Provide clear retry buttons
- **Fallback**: Offer alternative actions when possible

### **Debug vs Production**

#### **Development (Debug Mode)**
```typescript
// Show detailed error information
console.error('Detailed error:', error)
toast({
  title: "Debug Error",
  description: `Error: ${error.message}\nStatus: ${error.status}`,
  variant: "destructive"
})
```

#### **Production (User Mode)**
```typescript
// Show user-friendly messages only
toast({
  title: "Error",
  description: "Something went wrong. Please try again.",
  variant: "destructive"
})
```

### **Error Logging Strategy**

#### **Frontend Logging**
- ✅ Use proper logging service (Sentry, LogRocket)
- ✅ Log user actions, not sensitive data
- ✅ Include device info for mobile debugging

#### **Backend Logging**
- ✅ Use structured logging (JSON format)
- ✅ Include request context (user ID, IP, user agent)
- ✅ Log errors with stack traces
- ✅ Monitor error rates and patterns

### **Mobile-Specific Error Patterns**

#### **Common Mobile Issues**
1. **Network Switching**: WiFi to cellular, airplane mode
2. **Browser Limitations**: Safari restrictions, Chrome updates
3. **Storage Issues**: Low storage, cache problems
4. **Performance**: Slow devices, memory constraints

#### **Solutions**
1. **Network Detection**: Detect network changes and retry
2. **Progressive Enhancement**: Work with browser limitations
3. **Storage Management**: Clear cache, compress data
4. **Performance Optimization**: Lazy load, optimize images

### **Error Message Templates**

#### **Generic Error Template**
```typescript
const getErrorMessage = (error: any, context: string) => {
  if (error.status === 0) {
    return "Network error. Please check your internet connection and try again."
  }
  
  if (error.status >= 500) {
    return "Server error. Please try again in a few minutes."
  }
  
  if (error.status === 401) {
    return "Session expired. Please log in again."
  }
  
  return error.message || "An unexpected error occurred. Please try again."
}
```

#### **Context-Specific Messages**
```typescript
const errorMessages = {
  login: {
    invalid_credentials: "Invalid email or password. Please check your credentials.",
    network_error: "Network error. Please check your internet connection and try again.",
    server_error: "Server error. Please try again in a few minutes."
  },
  payment: {
    initialization_failed: "Payment system is currently unavailable. Please try again later.",
    verification_failed: "Payment verification failed. Please contact support if you were charged.",
    network_error: "Payment connection error. Please check your internet and try again."
  },
  upload: {
    file_too_large: "File is too large. Please choose a smaller image.",
    invalid_format: "Invalid file format. Please use JPG, PNG, or GIF.",
    storage_error: "Storage error. Please try again or contact support."
  }
}
```

### **Testing Error Scenarios**

#### **Mobile Testing Checklist**
- [ ] Test with poor network connection
- [ ] Test with airplane mode on/off
- [ ] Test with different mobile browsers
- [ ] Test with low storage space
- [ ] Test with slow device performance
- [ ] Test with different screen sizes
- [ ] Test with accessibility features enabled

#### **Error Simulation**
```typescript
// Simulate network errors
const simulateNetworkError = () => {
  throw new APIError('Network error. Please check your internet connection and try again.', 0)
}

// Simulate server errors
const simulateServerError = () => {
  throw new APIError('Server error. Please try again in a few minutes.', 500)
}

// Simulate timeout errors
const simulateTimeoutError = () => {
  throw new APIError('Request timed out. Please try again.', 408)
}
```

This guide ensures that all error messages are professional, user-friendly, and specifically optimized for mobile users. 