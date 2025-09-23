// Test login with one of the dummy users
const testLogin = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'patient1@example.com',
        password: '123456',
      }),
    });

    console.log('Login test response status:', response.status);
    const data = await response.text();
    console.log('Response:', data);
  } catch (error) {
    console.error('Test login error:', error);
  }
};

testLogin();