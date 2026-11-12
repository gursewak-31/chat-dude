import axios from "axios";
import type { LoginData, SignupData } from "../types/auth-types";
import { getToken, updateToken } from "@/utils/token-bridge";

const req = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true
});

// Separate instance for refreshing tokens
const refreshReq = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true
});

let refreshPromise: Promise<string> | null = null;

// Attach access token
req.interceptors.request.use(config => {

    const token = getToken();

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
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

export async function signup(data: SignupData){
    try{
        let res = await req.post("/auth/signup", data, {headers: {"Content-Type": "application/json"}});

        return res.data;
    }catch(error){
        if(axios.isAxiosError(error)){
            return error.response?.data;
        }
        return {success: false, msg: "Somthing went wrong. please try again later."};
    }
}

export async function login(credentials: LoginData){
    try{
        let res = await req.post("/auth/login", credentials, {headers: {"Content-Type": "application/json"}});

        return res.data;
    }catch(error){
        if(axios.isAxiosError(error)){
            return error.response?.data;
        }
        return {success: false, msg: "Somthing went wrong. please try again later."};
    }
}

export async function getUser(){
    try{
        let res = await req.get("/auth/user");

        return res.data;
    }catch(error){
        if(axios.isAxiosError(error)){
            return error.response?.data;
        }
        return {success: false, msg: "Somthing went wrong. please try again later."};
    }
}

export async function logout(){
    try{
        let res = await req.get("/auth/logout");

        return res.data;
    }catch(error){
        if(axios.isAxiosError(error)){
            return error.response?.data;
        }
        return {success: false, msg: "Somthing went wrong. please try again later."};
    }
}

// export async function refresh(){
//     const res = await req.get("/auth/refresh");

//     return res.data.accessToken;
// }

export async function refresh() {

    if (!refreshPromise) {
        refreshPromise = refreshReq
            .get("/auth/refresh")
            .then(res => {
                const newToken = res.data.accessToken;

                updateToken(newToken);

                return newToken;
            })
            .finally(() => {
                refreshPromise = null;
            });
    }

    return refreshPromise;
}