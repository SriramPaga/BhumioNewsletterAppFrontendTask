// import axios from 'axios';

// const baseURL = 'http://localhost:8000/api';

// const client = axios.create({
//   baseURL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// let unauthorizedHandler = null;

// const setAuthToken = (token) => {
//   if (token) {
//     client.defaults.headers.common.Authorization = `Bearer ${token}`;
//   } else {
//     delete client.defaults.headers.common.Authorization;
//   }
// };

// export const setUnauthorizedHandler = (handler) => {
//   unauthorizedHandler = handler;
// };

// client.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       unauthorizedHandler?.();
//     }

//     const message =
//       error.response?.data?.message ||
//       error.message ||
//       'Server error';
//     return Promise.reject(new Error(message));
//   },
// );

// export default {
//   setAuthToken,
//   setUnauthorizedHandler,
//   login: (payload) => client.post('/auth/login', payload),
//   getSubscribers: (page = 1, limit = 50) =>
//     client.get('/subscribers', {
//       params: { page, limit },
//     }),
//   createSubscriber: (payload) => client.post('/subscribers', payload),
//   getLists: () => client.get('/lists'),
//   createList: (payload) => client.post('/lists', payload),
//   importCsv: (listId, file) => {
//     const formData = new FormData();
//     formData.append('file', file);
//     return client.post(`/lists/${listId}/import-csv`, formData, {
//       headers: { 'Content-Type': 'multipart/form-data' },
//     });
//   },
//   segmentSubscribers: (listId, filters) =>
//     client.post(`/lists/${listId}/segment`, filters),
//   getCampaigns: () => client.get('/campaigns'),
//   createCampaign: (payload) => client.post('/campaigns', payload),
//   sendCampaign: (id, filters) => client.post(`/campaigns/${id}/send`, filters),
//   getStats: () => client.get('/click-stats'),
//   getCampaignStats: (campaignId) =>
//     client.get(`/click-stats/campaign/${campaignId}`),
//   getAutomationHealth: () => client.get('/queues/health'),
// };


import axios from 'axios';

const baseURL = 'http://localhost:8000/api';

const client = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let unauthorizedHandler = null;

// ✅ Set auth token globally
const setAuthToken = (token) => {
  if (token) {
    client.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete client.defaults.headers.common.Authorization;
  }
};

// ✅ Handle 401 globally
export const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = handler;
};

// 🔥 REQUEST INTERCEPTOR (NEW - IMPORTANT)
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('newsletter_token');
  const orgId = localStorage.getItem('orgId');

  // Attach token (backup if not already set)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Attach organizationId for POST/PUT/PATCH requests
  if (
    (config.method === 'post' ||
      config.method === 'put' ||
      config.method === 'patch') &&
    config.data &&
    !(config.data instanceof FormData)
  ) {
    config.data = {
      ...config.data,
      organizationId: orgId,
    };
  }

  return config;
});

// ✅ RESPONSE INTERCEPTOR (existing)
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      unauthorizedHandler?.();
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      'Server error';

    return Promise.reject(new Error(message));
  },
);

export default {
  setAuthToken,
  setUnauthorizedHandler,

  // 🔐 Auth
  login: (payload) => client.post('/auth/login', payload),

  // 👥 Subscribers
  getSubscribers: (page = 1, limit = 50) =>
    client.get('/subscribers', {
      params: { page, limit },
    }),
  createSubscriber: (payload) => client.post('/subscribers', payload),

  // 📋 Lists
  getLists: () => client.get('/lists'),
  createList: (payload) => client.post('/lists', payload),
  importCsv: (listId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return client.post(`/lists/${listId}/import-csv`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  segmentSubscribers: (listId, filters) =>
    client.post(`/lists/${listId}/segment`, filters),

  // 📧 Campaigns
  getCampaigns: () => client.get('/campaigns'),
  createCampaign: (payload) => client.post('/campaigns', payload),
  sendCampaign: (id, filters = {}) =>
    client.post(`/campaigns/${id}/send`, filters),

  // 📊 Analytics
  getStats: () => client.get('/click-stats'),
  getCampaignStats: (campaignId) =>
    client.get(`/click-stats/campaign/${campaignId}`),

  // ⚙️ Queue / Automation
  getAutomationHealth: () => client.get('/queues/health'),
};