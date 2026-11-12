import axios from "axios";
import { getToken, updateToken } from "@/utils/token-bridge";
import { refresh } from "@/api/auth-api";

const req = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true
});

// Separate instance for refreshing tokens
const refreshReq = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true
});

// Attach access token
req.interceptors.request.use(config => {
    // Don't overwrite an Authorization header
    // that was explicitly set for this request.
    if (!config.headers.Authorization) {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Refresh interceptor
req.interceptors.response.use(
    response => response,
    async error => {
        const originalReq = error.config;

        if (
            error.response?.status !== 401 ||
            !originalReq ||
            originalReq._retry ||
            originalReq.url?.includes("/auth/refresh")
        ) {
            return Promise.reject(error);
        }

        originalReq._retry = true;

        try {
            const newToken = await refresh();

            originalReq.headers.Authorization =
                `Bearer ${newToken}`;

            return req(originalReq);

        } catch (refreshError) {
            updateToken(null);

            return Promise.reject(refreshError);
        }
    }
);

export { req, refreshReq }