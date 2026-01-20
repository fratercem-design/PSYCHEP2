async function testStripeCheckout() {
  try {
    const response = await fetch('http://localhost:3000/api/stripe/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Test Ad Campaign',
        imageUrl: 'https://via.placeholder.com/300x250',
        linkUrl: 'https://example.com',
      }),
    });

    console.log('Stripe Checkout Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Stripe Checkout Data:', data);
    } else {
      const text = await response.text();
      console.log('Stripe Checkout Error:', text);
    }
  } catch (error) {
    console.error('Stripe Checkout Test Failed:', error);
  }
}

testStripeCheckout();