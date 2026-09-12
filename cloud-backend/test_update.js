const axios = require('axios');
async function test() {
  try {
    const res = await axios.put('http://localhost:3000/api/auth/update-profile', {
      userId: '3c3f5ef1-a31c-40ef-ba14-44b0cb026bf9', // The ID from the user's JSON
      username: 'kira'
    });
    console.log(res.data);
  } catch(e) {
    console.log(e.response?.data || e.message);
  }
}
test();
