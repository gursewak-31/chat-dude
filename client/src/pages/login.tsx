import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field"
import { Link, useNavigate } from "react-router" 
import React, { useEffect, useState, type FormEvent } from "react";
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { login } from "../api/auth-api";
import useToken from "@/hook/useToken";
import type { LoginData } from "@/types/auth-types";
import { useForm } from "react-hook-form";

export default function Login() {
    let [isShowPass, setIsShowPass] = useState(false);
    let [response, setResponse] = useState("");
    let {setToken} = useToken();
    let redirect = useNavigate();

    let { register, handleSubmit, formState } = useForm<LoginData>();

    async function handleLogin(data: LoginData){
        let res = await login(data);

        if(res.success){
            setToken(res.accessToken);
            redirect("/");
            return;
        }

        setResponse(res.msg);
    }

    useEffect(() => {
        if (!response) return;
        let timeout = window.setTimeout(() => setResponse(""), 5000);
        return () => window.clearTimeout(timeout);
    }, [response]);

    return(
        <div className="dark flex h-screen w-auto items-center justify-center bg-background text-primary">
            <div className="md:w-1/3 sm:w-1/2 w-full rounded-2xl bg-card border border-secondry p-3">
                <div className="w-full p-2 text-center">
                    <h2 className="font-bold">Welcome</h2>
                </div>

                <form onSubmit={handleSubmit(handleLogin)}>
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="username" >Email</FieldLabel>
                            <Input type="email" id="username" placeholder="example@gmail.com" aria-invalid={!!formState.errors.email} {...register("email", {
                                required: "Please enter email !",
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: "* Invalid email address !"
                                }
                            })}></Input>
                            {formState.errors.email?.message && (
                                <span className="text-xs text-red-700">* {formState.errors.email?.message}</span>
                            )}
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="password" >Password</FieldLabel>
                            <div className=" relative">
                                <Input type={isShowPass ? 'text' : 'password'} id="password" placeholder="********" aria-invalid={!!formState.errors.password} {...register("password", {
                                    required: "Please enter password !",
                                    minLength: {
                                        value: 8,
                                        message: "Password must be atleast 8 character long !"
                                    },
                                    maxLength: {
                                        value: 32,
                                        message: "Password is too long !"
                                    }
                                })}></Input>
                                <button className="cursor-pointer absolute right-1 bottom-1/5" type="button" onClick={() => setIsShowPass(!isShowPass)}>
                                    {isShowPass ? <FaEye/> : <FaEyeSlash/>}
                                </button>
                            </div>
                            {formState.errors.password?.message && (
                                <span className="text-xs text-red-700">{formState.errors.password?.message}</span>
                            )}
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