const axios = require('axios');

async function updateImages() {
  try {
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'crmisa1000@gmail.com',
      password: 'password123'
    });
    
    const token = loginRes.data.token;
    console.log('Logged in successfully!');

    const updates = [
      { id: 'd5970438-e05c-4f5d-afaa-ad952ce06661', image: '/uploads/delmaguey_transparent_full.png' },
      { id: 'prod_1787654841808_342', image: '/uploads/aberlour_transparent_full.png' },
      { id: 'prod_1787654842540_619', image: '/uploads/ardbeg_transparent_full.png' }
    ];

    for (const update of updates) {
      const res = await axios.put(`http://localhost:5000/api/products/${update.id}`, 
        { image: update.image },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(`Updated ${update.id}`);
    }
  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.message);
  }
}

updateImages();
