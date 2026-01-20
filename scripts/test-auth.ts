async function testAuthEndpoints() {
  try {
    // Test current user endpoint
    const userResponse = await fetch('http://localhost:3000/api/auth/current-user');
    console.log('Current User Status:', userResponse.status);
    
    if (userResponse.ok) {
      const userData = await userResponse.json();
      console.log('Current User Data:', userData);
    } else {
      const userText = await userResponse.text();
      console.log('Current User Error:', userText);
    }

    // Test sign-in endpoint
    const signinResponse = await fetch('http://localhost:3000/api/auth/signin');
    console.log('Signin Status:', signinResponse.status);
    
    if (signinResponse.ok) {
      const signinData = await signinResponse.json();
      console.log('Signin Data:', signinData);
    } else {
      const signinText = await signinResponse.text();
      console.log('Signin Error:', signinText);
    }

  } catch (error) {
    console.error('Auth Test Failed:', error);
  }
}

testAuthEndpoints();