import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field"
import { Link, useNavigate } from "react-router" 
import React, { useEffect, useState, type FormEvent } from "react";
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { login } from "../api/auth-api";

export default function Login() {
    let [isShowPass, setIsShowPass] = useState(false);
    let [email, setEmail] = useState("");
    let [password, setPassword] = useState("");
    let [invalidField, setInvalidField] = useState({email: "", password: ""});
    let [response, setResponse] = useState("");
    let redirect = useNavigate();

    async function handleLogin(e: FormEvent<HTMLFormElement>){
        e.preventDefault();
        let valid = validate();
        if(!valid) return;

        let res = await login({email: email, password: password});

        if(res.success){
            redirect("/");
            return;
        }

        setResponse(res.msg);
    }

    function validate(){
        let errors = {email: "", password: ""}

        if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
            errors.email = "Please enter valid email address."
        }
        if(!/^.{8,32}$/.test(password.trim())){
            errors.password = "Password must be 8 to 32 characters long.";
        }

        setInvalidField(errors);
        return !errors.email && !errors.password
    }

    useEffect(() => {
        if(response) setTimeout(() => setResponse(""), 5000);
    }, [response]);

    return(
        <div className="dark flex h-screen w-auto items-center justify-center bg-background text-primary">
            <div className="md:w-1/3 sm:w-1/2 w-full rounded-2xl bg-card border border-secondry p-3">
                <div className="w-full p-2 text-center">
                    <h2 className="font-bold">Welcome</h2>
                </div>

                <form onSubmit={handleLogin}>
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="username" >Email</FieldLabel>
                            <Input type="email" id="username" placeholder="example@gmail.com" aria-invalid={!!invalidField.email} value={email} onChange={(e) => {
                                setEmail(e.target.value);
                                setInvalidField({...invalidField, email: ""});
                            }}></Input>
                            {invalidField.email && <span className="text-xs text-red-700">* {invalidField.email}</span>}
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="password" >Password</FieldLabel>
                            <div className=" relative">
                                <Input type={isShowPass ? 'text' : 'password'} id="password" placeholder="********" aria-invalid={!!invalidField.password} value={password} onChange={(e) => {
                                    setPassword(e.target.value);
                                    setInvalidField({...invalidField, password: ""});
                                }}></Input>
                                <button className="cursor-pointer absolute right-1 bottom-1/5" type="button" onClick={() => setIsShowPass(!isShowPass)}>
                                    {isShowPass ? <FaEye/> : <FaEyeSlash/>}
                                </button>
                            </div>
                            {invalidField.password && <span className="text-xs text-red-700">* {invalidField.password}</span>}
                            {response && <span className="text-xs text-red-700">* {response}</span>}
                        </Field>
                        <Field orientation="vertical" className="items-center">
                            <div className="flex w-full items-center justify-center">
                                <Button type="submit">Login</Button>
                            </div>
                            <p className="text-center text-sm text-muted-foreground">Don't have account? <Link to="/signup" className="text-primary underline-offset-4 hover:underline">signup</Link></p>
                        </Field>
                    </FieldGroup>
                </form>
            </div>
        </div>
    )
}