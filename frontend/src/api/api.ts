// src/utils/api.ts

import axios from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import { log } from "node:console";

const api = axios.create({
  baseURL: "http://127.0.0.1:5000/api/",
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;