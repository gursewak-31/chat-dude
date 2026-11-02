import { useContext } from "react";
import { userContext } from "@/context/user-context";

export default function useUser(){
    let context = useContext(userContext);

    if(!context){
        throw new Error("user only accessible inside user provider");
    }

    return context;
}