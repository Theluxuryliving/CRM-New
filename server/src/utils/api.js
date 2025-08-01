// utils/api.js
export const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('token'); // or from context
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  const res = await fetch(url, { ...options, headers });
  return res.json();
};
