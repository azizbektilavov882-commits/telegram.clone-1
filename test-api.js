const axios = require('axios');

async function testAPI() {
  try {
    console.log('Testing login API...');
    
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      emailOrPhone: 'ali@test.com',
      password: 'password123'
    });
    
    console.log('✅ Login successful!');
    console.log('Token:', response.data.token.substring(0, 20) + '...');
    console.log('User:', response.data.user);
    
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
  }
}

testAPI();