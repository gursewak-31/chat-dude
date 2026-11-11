import { useEffect, useContext, useState } from "react";
import { Outlet } from "react-router-dom";
import { getUser, refresh } from "../../api/auth-api";
import { Navigate } from "react-router-dom";
import useUser from "@/hook/useUser";
import useToken from "@/hook/useToken";
import PageLoader from "./page-loader";
import { setTokenHandlers } from "@/utils/token-bridge";

export default function ProtectedRoutes(){
    let {user, setUser} = useUser();
    let {setToken, token} = useToken();
    let [loading, setLoading] = useState(true);

    useEffect(() => {
        // Connect React state with Axios token bridge
        setTokenHandlers(
            () => token,
            (newToken) => setToken(newToken || "")
        );
    }, [setToken]);

    useEffect(() => {
        let active = true;

        async function initializeAuth() {
            try {
                let currentToken = token;

                // No access token? Try refreshing it.
                if (!currentToken) {
                    currentToken = await refresh();
                    if (!active) return;
                    setToken(currentToken);
                }

                // Retrieve user using access token.
                const res = await getUser(currentToken);

                if (!active) return;

                if (!res.success) {
                    setUser(null);
                    return;
                }

                setUser(res.data);
            } catch (error) {
                if (!active) return;
                setToken("");
                setUser(null);
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        initializeAuth();

        return () => {
            active = false;
        };

    }, []);

    if(loading) return <PageLoader></PageLoader>

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return(
        <Outlet/>
    )
}