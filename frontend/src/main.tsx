import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes'
import axios from 'axios'
import './index.css'

// Intercept file:// protocol requests and route them to local backend
const isElectron = window.location.protocol === 'file:';
const BASE_URL = isElectron ? 'http://localhost:5000' : '';

// 1. Configure Axios
axios.defaults.baseURL = BASE_URL;

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
