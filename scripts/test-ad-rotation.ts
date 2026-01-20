async function testAdRotation() {
  try {
    const response = await fetch('http://localhost:3000/api/ads/rotation');
    console.log('Ad Rotation Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Ad Rotation Data:', data);
    } else {
      const text = await response.text();
      console.log('Ad Rotation Error:', text);
    }
  } catch (error) {
    console.error('Ad Rotation Test Failed:', error);
  }
}

testAdRotation();