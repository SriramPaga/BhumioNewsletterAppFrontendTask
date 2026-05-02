// FRONTEND_SKELETON.js

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt');
  const orgId = localStorage.getItem('orgId');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (orgId) config.headers['X-Org-Id'] = orgId;
  return config;
});

export const getSubscribers = async () => {
  const response = await api.get('/subscribers');
  return response.data;
};

export const createList = async (data) => {
  const response = await api.post('/lists', data);
  return response.data;
};

export const importCSV = async (listId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post(`/lists/${listId}/import`, formData);
  return response.data;
};

export const getStats = async () => {
  const response = await api.get('/stats');
  return response.data;
};

export const sendCampaign = async (id, filters) => {
  const response = await api.post(`/campaigns/${id}/send`, filters);
  return response.data;
};