import useUser from "@/hook/useUser";
import useToken from "@/hook/useToken";
import { getUser, refresh } from "@/api/auth-api";
import { setTokenHandlers } from "@/utils/token-bridge";
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import PageLoader from "./page-loader";

export default function PublicRoutes(){
    const { user, setUser } = useUser();
    const { token, setToken } = useToken();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTokenHandlers(
            () => token,
            (newToken) => setToken(newToken || "")
        );
    }, [token, setToken]);

    useEffect(() => {
        let active = true;

        async function restoreSession() {
            try {
                // The access token is held in memory, so restore it from the
                // refresh cookie before deciding whether these routes are public.
                const accessToken = token || await refresh();
                if (!active) return;

                if (!token) setToken(accessToken);

                const result = await getUser(accessToken);
                if (!active) return;

                setUser(result.success ? result.data : null);
            } catch {
                if (!active) return;
                setToken("");
                setUser(null);
            } finally {
                if (active) setLoading(false);
            }
        }

        restoreSession();
        return () => { active = false; };
    }, []);

    if (loading) return <PageLoader />;

    if(user){
        return <Navigate to={'/'} replace />
    }

    return (
        <Outlet/>
    )
}
