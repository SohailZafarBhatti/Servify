import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// ✅ Attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // token should be saved at login
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('Request config:', config);
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log('Response interceptor - success:', response);
    return response;
  },
  (error) => {
    console.log('Response interceptor - error:', error);
    console.log('Error response:', error.response);
    return Promise.reject(error);
  }
);

// ✅ Get profile
const getProfile = async () => {
  const res = await api.get("/users/me");
  return res.data.user;
};

// ✅ Update profile
const updateProfile = async (formData) => {
  try {
    console.log('Making PUT request to /users/me');
    console.log('Base URL:', API_URL);
    console.log('Full URL:', `${API_URL}/users/me`);
    
    const res = await api.put("/users/me", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    
    console.log('Update profile response:', res);
    console.log('Response data:', res.data);
    console.log('Response data type:', typeof res.data);
    console.log('Response data keys:', Object.keys(res.data || {}));
    
    if (!res.data) {
      throw new Error('No data in response');
    }
    
    if (!res.data.user) {
      console.log('Expected user data not found. Full response data:', JSON.stringify(res.data, null, 2));
      throw new Error('No user data in response');
    }
    
    return res.data.user;
  } catch (error) {
    console.error('Update profile error:', error);
    console.error('Error response:', error.response);
    console.error('Error response data:', error.response?.data);
    console.error('Error status:', error.response?.status);
    console.error('Error message:', error.message);
    throw error;
  }
};

export default { getProfile, updateProfile };
