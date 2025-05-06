import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with defaults
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to attach auth token to requests
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Get all products with optional filters
const getProducts = async (filters = {}) => {
  const { keyword, category, sort, page, limit, minPrice, maxPrice } = filters;
  
  let queryParams = new URLSearchParams();
  if (keyword) queryParams.append('keyword', keyword);
  if (category) queryParams.append('category', category);
  if (sort) queryParams.append('sort', sort);
  if (page) queryParams.append('page', page);
  if (limit) queryParams.append('limit', limit);
  if (minPrice) queryParams.append('minPrice', minPrice);
  if (maxPrice) queryParams.append('maxPrice', maxPrice);
  
  const response = await api.get(`/products?${queryParams.toString()}`);
  return response.data;
};

// Get featured products
const getFeaturedProducts = async (limit = 8) => {
  const response = await api.get(`/products/featured?limit=${limit}`);
  return response.data;
};

// Get product by ID
const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

// Get product categories
const getProductCategories = async () => {
  const response = await api.get('/products/categories');
  return response.data;
};

// Create product review
const createProductReview = async (productId, review) => {
  const response = await api.post(`/products/${productId}/reviews`, review);
  return response.data;
};

const productService = {
  getProducts,
  getFeaturedProducts,
  getProductById,
  getProductCategories,
  createProductReview
};

export default productService;
