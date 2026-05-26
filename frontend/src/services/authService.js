import axios from "axios";

const API = "http://localhost:5000/api/auth";
const USER_API = "http://localhost:5000/api/user";
const DASHBOARD_API = "http://localhost:5000/api/dashboard";

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
    },
  };
};

export const registerUser = async (data) => {
  const res = await axios.post(`${API}/register`, data);
  return res.data;
};

export const loginUser = async (data) => {
  const res = await axios.post(`${API}/login`, data);
  return res.data;
};

export const forgotPassword = async (email) => {
  const res = await axios.post(`${API}/forgot-password`, { email });
  return res.data;
};

export const resetPassword = async (token, password) => {
  const res = await axios.put(`${API}/reset-password/${token}`, { password });
  return res.data;
};

export const fetchDashboardData = async () => {
  const res = await axios.get(DASHBOARD_API, getAuthConfig());
  return res.data;
};

export const updateBodyType = async (answers) => {
  const res = await axios.post(`${USER_API}/body-type`, { answers }, getAuthConfig());
  return res.data;
};

export const getUserProfile = async () => {
  const res = await axios.get(`${USER_API}/profile`, getAuthConfig());
  return res.data;
};

export const updateUserProfile = async (formData) => {
  const res = await axios.put(`${USER_API}/profile`, formData, getAuthMultipartConfig());
  return res.data;
};

export const deleteUserAccount = async () => {
  const res = await axios.delete(USER_API, getAuthConfig());
  return res.data;
};

const authService = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  fetchDashboardData,
  updateBodyType,
  saveStyleProfile: async (styleData) => {
    const res = await axios.post(`${USER_API}/style-profile`, styleData, getAuthConfig());
    return res.data;
  },
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
};

export default authService;