import axios from 'axios';

const API_URL = 'http://localhost:5000/api/wardrobe';

// Helper to get auth config
const getAuthConfig = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

const getAuthMultipartConfig = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  };
};

export const fetchWardrobeItems = async () => {
  const response = await axios.get(API_URL, getAuthConfig());
  return response.data;
};

export const addWardrobeItem = async (formData) => {
  const response = await axios.post(API_URL, formData, getAuthMultipartConfig());
  return response.data;
};

export const updateWardrobeItem = async (id, formData) => {
  const response = await axios.put(`${API_URL}/${id}`, formData, getAuthMultipartConfig());
  return response.data;
};

export const deleteWardrobeItem = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, getAuthConfig());
  return response.data;
};

const wardrobeService = {
  fetchWardrobeItems,
  addWardrobeItem,
  updateWardrobeItem,
  deleteWardrobeItem,
};

export default wardrobeService;
