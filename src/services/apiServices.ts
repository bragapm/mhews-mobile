import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export const BASE_URL = "https://mhewsmobile.braga.co.id/";
export const ASSET_URL = "https://mhewsmobile.braga.co.id/assets/";
export const MAPBOX_ACCESS_TOKEN =
    'sk.eyJ1Ijoid2hvaXNhcnZpYW4iLCJhIjoiY203YjJkajRtMDk3cDJtczlxMDRrOTExNiJ9.61sU5Z9qNoRfQ22qdcAMzQ';

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
        try {
            const token = await AsyncStorage.getItem("token");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error("Error getting token:", error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            console.error("API Error:", {
                status: error.response.status,
                data: error.response.data,
                headers: error.response.headers,
            });
        } else if (error.request) {
            console.error("No response received:", error.request);
        } else {
            console.error("Request setup error:", error.message);
        }
        return Promise.reject(error);
    }
);


export const getData = async (endpoint: string, params = {}) => {
    try {
        console.log(`Fetching data from ${BASE_URL}${endpoint}`, params);
        const response = await api.get(endpoint, { params });
        return response.data;
    } catch (error) {
        console.error("Error fetching data:", error);
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

export const patchData = async (endpoint: string, data = {}) => {
    try {
        const response = await api.patch(endpoint, data);
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
