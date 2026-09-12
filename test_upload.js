const axios = require('axios');
const FormData = require('form-data');

async function testUpload() {
  const form = new FormData();
  form.append('file', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=');
  
  // Try to read from env or use dummy
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'demo';
  const preset = process.env.CLOUDINARY_UPLOAD_PRESET || 'docs_upload_example_us_preset';

  form.append('upload_preset', preset);

  try {
    const res = await axios.post(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, form, {
      headers: form.getHeaders(),
    });
    console.log('Success:', res.data.secure_url);
  } catch (err) {
    if (err.response) {
      console.log('Error Status:', err.response.status);
      console.log('Error Data:', err.response.data);
    } else {
      console.log('Error:', err.message);
    }
  }
}

testUpload();
