import axios from "axios";
import { getToken, updateToken } from "@/utils/token-bridge";

let req = axios.create({
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

export async function getConnections(){
    try{
        let res = await req.get("/app/connections");

        return res.data
    }catch(error){
        if(axios.isAxiosError(error)){
            return error.response?.data;
        }
        return {success: false, msg: "Somthing went wrong. please try again later."};
    }
}

export async function getUsers(){
    try{
        let res = await req.get("/app/users");

        return res.data;
    }catch(error){
        if(axios.isAxiosError(error)){
            return error.response?.data;
        }
        return {success: false, msg: "Somthing went wrong. please try again later."};
    }
}

export async function getChat(conversationId: string){
    try{
        let res = await req.get(`/app/conversation/${conversationId}`);

        return res.data;
    }catch(error){
        if(axios.isAxiosError(error)){
            return error.response?.data;
        }
        return {success: false, msg: "Somthing went wrong. please try again later."};
    }
}

export async function addNewConnection(newConnectionId: string){
    try{
        let res = await req.post("/app/new-connection", { connectionId: newConnectionId }, {headers: { "Content-Type": "application/json"}});

        return res.data;
    }catch(error){
        if(axios.isAxiosError(error)){
            return error.response?.data;
        }
        return {success: false, msg: "Somthing went wrong. please try again later."};
    }
}

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