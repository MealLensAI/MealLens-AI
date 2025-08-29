// Simple test script to verify login API
const testLogin = async () => {
  try {
    console.log('Testing login API...')
    
    const response = await fetch('https://meallens-ai-cmps.onrender.com/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:5174'
      },
      body: JSON.stringify({
        email: 'ceo@meallensai.com',
        password: 'Test123!'
      })
    })
    
    console.log('Response status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))
    
    const data = await response.json()
    console.log('Response data:', data)
    
    if (data.status === 'success') {
      console.log('✅ Login successful!')
      return data
    } else {
      console.log('❌ Login failed:', data.message)
      return null
    }
  } catch (error) {
    console.error('❌ Login error:', error)
    return null
  }
}

// Run the test
testLogin() 