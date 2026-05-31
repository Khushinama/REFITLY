import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const API_URL = `${BASE_URL}/history`;

// Helper to get auth config
const getAuthConfig = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

/**
 * Mark outfit as worn today
 * @param {Object} data - { outfitId, outfit, event, notes }
 */
export const wearOutfit = async (data) => {
  const response = await axios.post(`${API_URL}/wear`, data, getAuthConfig());
  return response.data;
};

/**
 * Fetch outfit history
 */
export const fetchHistory = async () => {
  const response = await axios.get(API_URL, getAuthConfig());
  return response.data;
};

/**
 * Fetch outfit history grouped by date for a specific month and year
 * @param {number} month - Month (1-12)
 * @param {number} year - Year (YYYY)
 */
export const fetchCalendarHistory = async (month, year) => {
  const response = await axios.get(`${API_URL}/calendar`, {
    ...getAuthConfig(),
    params: { month, year }
  });
  return response.data;
};

/**
 * Fetch outfit history for specific date
 * @param {string} date - Date in format YYYY-MM-DD
 */
export const fetchHistoryByDate = async (date) => {
  const response = await axios.get(`${API_URL}/${date}`, getAuthConfig());
  return response.data;
};

/**
 * Delete outfit history entry
 * @param {string} id - History Entry ID
 */
export const deleteHistoryEntry = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, getAuthConfig());
  return response.data;
};

const historyService = {
  wearOutfit,
  fetchHistory,
  fetchCalendarHistory,
  fetchHistoryByDate,
  deleteHistoryEntry,
};

export default historyService;
