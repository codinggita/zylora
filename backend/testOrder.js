
const axios = require('axios');

const testOrder = async () => {
  try {
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'test@test.com', // Assuming this user exists
      password: 'password123'
    });

    const token = loginRes.data.token;

    const orderRes = await axios.post('http://localhost:5000/api/orders', {
      orderItems: [
        {
          name: 'Test Product',
          quantity: 1,
          image: 'test.jpg',
          price: 100,
          product: '123' // Static ID
        }
      ],
      shippingAddress: {
        name: 'Test User',
        mobile: '1234567890',
        address: 'Test Address'
      },
      paymentMethod: 'UPI',
      totalPrice: 100
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('Order created successfully:', orderRes.data);
  } catch (error) {
    console.error('Order creation failed:', error.response ? error.response.data : error.message);
  }
};

// Uncomment to run if server is up
// testOrder();
