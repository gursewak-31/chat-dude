import { createContext, useState } from "react";
import type { TokenContext } from "@/types/auth-types";

export const tokenContext = createContext<TokenContext | null>(null);

export default function TokenProvider({ children }: {children: React.ReactNode}){
    let [token, setToken] = useState("");

    return(
        <tokenContext.Provider value={{token, setToken}}>
            {children}
        </tokenContext.Provider>
    )
}