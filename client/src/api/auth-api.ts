import axios from "axios";
import type { LoginData, SignupData } from "../types/auth-types";

const req = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true
});

export async function signup(data: SignupData){
    try{
        console.log(data)
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