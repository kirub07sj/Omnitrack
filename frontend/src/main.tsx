import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes'
import axios from 'axios'
import './index.css'

// Intercept file:// protocol requests and route them to local backend
const isElectron = window.location.protocol === 'file:';
const BASE_URL = isElectron ? 'http://localhost:5055' : '';

// 1. Configure Axios
axios.defaults.baseURL = BASE_URL;

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token && import.meta.env.VITE_MODE === 'cloud') {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // In cloud mode, axios calls should also use the cloud API base url if they are using relative paths
  if (import.meta.env.VITE_MODE === 'cloud' && config.url?.startsWith('/api')) {
    config.baseURL = import.meta.env.VITE_API_BASE_URL || '/api';
  }
  return config;
});

// 2. Wrap native fetch
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  let [resource, config] = args;
  if (typeof resource === 'string' && resource.startsWith('/api')) {
    resource = BASE_URL + resource;
  }
  return originalFetch(resource, config);
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
