import axios from "axios";

const BASE_URL = "https://mhewsmobile.braga.co.id/panel";

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

api.interceptors.request.use(
    async (config) => {
        // const token = await AsyncStorage.getItem("token");
        // if (token) {
        //     config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("API Error:", error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export const getData = async (endpoint: string, params = {}) => {
    try {
        const response = await api.get(endpoint, { params });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const postData = async (endpoint: string, data = {}) => {
    return true;
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

export const deleteData = async (endpoint: string) => {
    try {
        const response = await api.delete(endpoint);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export default api;
