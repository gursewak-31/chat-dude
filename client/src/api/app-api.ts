import axios from "axios";
import { req } from "@/api/api-config";

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