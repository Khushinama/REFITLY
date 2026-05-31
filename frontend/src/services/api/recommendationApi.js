import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const API_URL = `${BASE_URL}/recommendations`;

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
 * Fetch outfit recommendations
 * @param {Object} params - { event, style, season, page, limit, excludeRecent }
 */
export const fetchRecommendations = async (params) => {
  const { event, style, season, page, limit, excludeRecent } = params;
  
  // Transform style array to comma-separated string for API
  const styleStr = Array.isArray(style) ? style.join(',') : style;
  
  const response = await axios.get(`${API_URL}/outfits`, {
    ...getAuthConfig(),
    params: {
      event,
      style: styleStr,
      season,
      page,
      limit,
      excludeRecent
    }
  });
  
  return response.data;
};

/**
 * Fetch saved outfits
 */
export const fetchSavedOutfits = async () => {
  const response = await axios.get(`${API_URL}/saved`, getAuthConfig());
  return response.data;
};

/**
 * Submit feedback for an outfit
 * @param {string} outfitId 
 * @param {string} feedback - 'like' | 'save' | 'dislike'
 * @param {Object} outfit - The full outfit object (needed for persistence)
 */
export const submitOutfitFeedback = async (outfitId, feedback, outfit = null) => {
  const response = await axios.post(
    `${API_URL}/feedback`,
    { outfitId, feedback, outfit },
    getAuthConfig()
  );
  return response.data;
};

/**
 * Fetch today's AI powered recommendation
 */
export const fetchTodayRecommendation = async () => {
  const response = await axios.get(`${API_URL}/today`, getAuthConfig());
  return response.data;
};

/**
 * Fetch a Pexels image for an accessory
 * @param {string} query 
 */
export const fetchAccessoryImage = async (query) => {
  const response = await axios.get(`${API_URL}/image`, {
    ...getAuthConfig(),
    params: { query }
  });
  return response.data;
};

const recommendationApi = {
  fetchRecommendations,
  fetchSavedOutfits,
  submitOutfitFeedback,
  fetchTodayRecommendation,
  fetchAccessoryImage
};

export default recommendationApi;
