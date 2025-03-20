import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export const BASE_URL = 'https://mhewsmobile.braga.co.id/';
export const ASSET_URL = 'https://mhewsmobile.braga.co.id/assets/';
export const MAPBOX_ACCESS_TOKEN =
  'sk.eyJ1Ijoid2hvaXNhcnZpYW4iLCJhIjoiY203YjJkajRtMDk3cDJtczlxMDRrOTExNiJ9.61sU5Z9qNoRfQ22qdcAMzQ';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.request.use(
  async config => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      if (error.response.status === 401) {
        const errorMessage =
          error.response.data?.errors?.[0]?.message || 'Invalid credentials';
        const errorCode =
          error.response.data?.errors?.[0]?.extensions?.code || 'UNKNOWN_ERROR';

        return Promise.reject({
          status: error.response.status,
          message: errorMessage,
          code: errorCode,
          data: error.response.data,
        });
      } else {
        // Menggunakan pesan error dari response jika ada
        const errorMessage =
          error.response.data?.error || 'An unexpected error occurred';
        return Promise.reject({
          status: error.response.status,
          message: errorMessage,
          data: error.response.data,
        });
      }
    } else if (error.request) {
      return Promise.reject({
        status: null,
        message: 'No response from the server',
      });
    } else {
      return Promise.reject({
        status: null,
        message: 'Failed to setup the request',
      });
    }
  },
);

export const getData = async (endpoint: string, params = {}) => {
  try {
    const response = await api.get(endpoint, {params});
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const postData = async (endpoint: string, data = {}) => {
  try {
    const response = await api.post(endpoint, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const putData = async (endpoint: string, data = {}) => {
  try {
    const response = await api.put(endpoint, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const patchData = async (
  endpoint: string,
  data = {},
  options: {returnStatus?: boolean} = {},
) => {
  try {
    const response = await api.patch(endpoint, data);
    return options.returnStatus ? response : response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteData = async (endpoint: string) => {
  try {
    const response = await api.delete(endpoint);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default api;
