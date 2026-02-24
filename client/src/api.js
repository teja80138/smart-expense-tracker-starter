import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000',
});

// add user id header automatically
API.interceptors.request.use(config => {
  const userId = localStorage.getItem('userId');
  if (userId) {
    config.headers['x-user-id'] = userId;
  }
  return config;
});

export default API;
