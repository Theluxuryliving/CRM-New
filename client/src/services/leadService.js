// services/leadService.js
import { fetchWithAuth } from '../utils/api';

const API_URL = 'http://localhost:4000/api/leads';

export const getLeads = async () => {
  return await fetchWithAuth(API_URL);
};

export const createLead = async (leadData) => {
  return await fetchWithAuth(API_URL, {
    method: 'POST',
    body: JSON.stringify(leadData),
  });
};

export const updateLead = async (id, updates) => {
  return await fetchWithAuth(`${API_URL}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
};

export const deleteLead = async (id) => {
  return await fetchWithAuth(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
};
