// Simple test to verify auth context
console.log('Testing auth context...')

// Test localStorage
localStorage.setItem('access_token', 'test-token')
localStorage.setItem('user_data', JSON.stringify({
  uid: 'test-user',
  email: 'test@example.com',
  displayName: 'Test User',
  role: 'user'
}))

console.log('Stored token:', localStorage.getItem('access_token'))
console.log('Stored user:', localStorage.getItem('user_data'))

// Test if the app can access these
const token = localStorage.getItem('access_token')
const userData = localStorage.getItem('user_data')

if (token && userData) {
  console.log('✅ Auth data is accessible')
  console.log('Token:', token.substring(0, 20) + '...')
  console.log('User:', JSON.parse(userData))
} else {
  console.log('❌ Auth data not found')
}

// Clean up
localStorage.removeItem('access_token')
localStorage.removeItem('user_data') 