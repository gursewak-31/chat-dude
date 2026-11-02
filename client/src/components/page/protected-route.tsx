import { useEffect, useContext } from "react";
import { Outlet } from "react-router-dom";
import { getUser } from "../../api/auth-api";
import { useNavigate } from "react-router-dom";
import useUser from "@/hook/useUser";

export default function ProtectedRoutes(){
    let redirect = useNavigate();
    let {user, setUser} = useUser();

    async function userData(){
        let res = await getUser();

        if(!res.success){
            redirect("/login");
            return;
        }

        setUser(res.data);
    }

    useEffect(() => {
        userData();
    }, []);

    return(

        <Outlet/>

    )
}