import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

export const login = async (data: any) => {
  const response = await axios.post(`${API_URL}/auth/login`, data);
  if (response.data.access_token) {
    localStorage.setItem('token', response.data.access_token);
  }
  return response.data;
};

export const register = async (data: any) => {
  const response = await axios.post(`${API_URL}/auth/register`, data);
  if (response.data.access_token) {
    localStorage.setItem('token', response.data.access_token);
  }
  return response.data;
};

export const getMe = async () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  const response = await axios.get(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
};
