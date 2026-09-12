import { useAppStore } from './store/useAppStore';
import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes'
import axios from 'axios'
import './index.css'
import { isCloudMode, apiConfig } from './lib/api'

// Intercept file:// protocol requests and route them to local backend
const isElectron = typeof window !== 'undefined' && window.location.protocol === 'file:';
const BASE_URL = isElectron ? 'http://localhost:5055' : (isCloudMode ? apiConfig.baseUrl : '');

// 1. Configure Axios
axios.defaults.baseURL = BASE_URL;
axios.defaults.withCredentials = true;

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token && isCloudMode) {
    if (config.headers) {
      if (typeof config.headers.set === 'function') {
        config.headers.set('Authorization', `Bearer ${token}`);
      } else {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
  }
  // In cloud mode, axios calls should also use the cloud API base url if they are using relative paths
  if (isCloudMode && config.url?.startsWith('/api') && !config.url?.startsWith('http')) {
    config.baseURL = apiConfig.baseUrl || 'https://omnitrack-cloud-backend.vercel.app';
  }
  return config;
});

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAppStore.getState().logout();
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    if (error.response?.status === 403) {
      useAppStore.getState().applyAccountAccessFromPayload(error.response.data);
    }
    return Promise.reject(error);
  }
);

// 2. Wrap native fetch
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  let [resource, config] = args;
  if (typeof resource === 'string' && resource.startsWith('/api') && !resource.startsWith('http')) {
    const apiUrl = apiConfig.baseUrl || 'https://omnitrack-cloud-backend.vercel.app';
    resource = isCloudMode ? apiUrl + (resource.startsWith('/api') ? resource : '/api' + resource) : BASE_URL + resource;
    
    if (isCloudMode) {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config = config || {};
        config.headers = {
          ...config.headers,
          'Authorization': `Bearer ${token}`
        };
      }
    }
  }
  return originalFetch(resource, config).then(async (res) => {
    if (res.status === 401) {
      useAppStore.getState().logout();
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    if (res.status === 403) {
      try {
        const data = await res.clone().json();
        useAppStore.getState().applyAccountAccessFromPayload(data);
      } catch {
        // ignore non-JSON 403s
      }
    }
    return res;
  });
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
