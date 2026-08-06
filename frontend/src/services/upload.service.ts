import axios from 'axios';

export const UploadService = {
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await axios.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Prepend the backend URL to bypass Vite proxy and support Electron desktop environment
    return `http://localhost:5000${response.data.url}`;
  }
};
