import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api').replace(/\/$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchCourses = async () => {
  const response = await api.get('/courses');
  return response.data;
};

export const generateCourse = async (topic, difficulty) => {
  const response = await api.post(`/courses/generate?topic=${encodeURIComponent(topic)}&difficulty=${encodeURIComponent(difficulty)}`);
  return response.data;
};

export default api;
