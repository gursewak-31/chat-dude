import { tokenContext } from "@/context/token-context";
import { useContext } from "react";

export default function useToken(){
    let context = useContext(tokenContext);

    if(!context){
        throw new Error("token only accessible inside token provider");
    }

    return context;
}