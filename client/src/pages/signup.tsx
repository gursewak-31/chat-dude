import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { signup } from "../api/auth-api";
import useToken from "@/hook/useToken";
import { useForm } from "react-hook-form";
import type { SignupData } from "@/types/auth-types";

export default function SignUp() {
    const [isShowPass, setIsShowPass] = useState(false);
    const [response, setResponse] = useState("");
    const {setToken} = useToken();
    const redirect = useNavigate();
    const isRequesting = useRef(false);
    const [loading, setLoading] = useState(false);

    let { register, handleSubmit, formState } = useForm<SignupData>();

    async function handleSignup(data: SignupData) {
        if (isRequesting.current) return; // prevent multiple requests before the first one is completed
        isRequesting.current = true;
        setLoading(true);

        const res = await signup(data);

        isRequesting.current = false;
        setLoading(false);

        if (res.success) {
            setToken(res.accessToken)
            redirect("/");
            return;
        }

        setResponse(res.msg);
    }

    useEffect(() => {
        if (!response) return;
        const timeout = window.setTimeout(() => setResponse(""), 5000);
        return () => window.clearTimeout(timeout);
    }, [response]);

    return (
        <div className="dark flex min-h-screen w-auto items-center justify-center bg-background px-4 py-8 text-primary">
            <div className="w-full rounded-2xl border border-secondry bg-card p-3 sm:w-1/2 md:w-1/3">
                <div className="w-full p-2 text-center">
                    <h2 className="font-bold">Create an Account</h2>
                </div>

                <form onSubmit={handleSubmit(handleSignup)}>
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="name">Name</FieldLabel>
                            <Input id="name" type="text" autoComplete="name" placeholder="Your name" aria-invalid={!!formState.errors.name} {...register("name", {
                                required: "Please enter your name !"
                            })}/>
                            {formState.errors.name?.message && (
                                <span className="text-xs text-destructive">* {formState.errors.name?.message}</span>
                            )}
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="email">Email</FieldLabel>
                            <Input id="email" type="email" autoComplete="email" placeholder="example@gmail.com" aria-invalid={!!formState.errors.email} {...register("email", {
                                required: "Please enter email !",
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: "Invalid email address !"
                                }
                            })} />
                            {formState.errors.email?.message && (
                                <span className="text-xs text-destructive">* {formState.errors.email?.message}</span>
                            )}
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="password">Password</FieldLabel>
                            <div className="relative">
                                <Input id="password" type={isShowPass ? "text" : "password"} autoComplete="new-password" placeholder="At least 8 characters" aria-invalid={!!formState.errors.password} {...register("password", {
                                    required: "Please enter password !",
                                    minLength: {
                                        value: 8,
                                        message: "Please enter atleast 8 character long !"
                                    },
                                    maxLength: {
                                        value: 32,
                                        message: "Password is too long !"
                                    }
                                })} />
                                <button className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer" type="button" aria-label={isShowPass ? "Hide password" : "Show password"} onClick={() => setIsShowPass((shown) => !shown)}>
                                    {isShowPass ? <FaEye /> : <FaEyeSlash />}
                                </button>
                            </div>
                            {formState.errors.password?.message && (
                                <span className="text-xs text-destructive">* {formState.errors.password?.message}</span>
                            )}
                        </Field>

                        {response && <span role="alert" className="px-2 text-xs text-destructive">* {response}</span>}

                        <Field className="items-center justify-center">
                            <div className="flex w-full items-center justify-center">
                                <Button type="submit" disabled={loading}>
                                    {loading ? 'Signing up...' : 'Sign up'}
                                </Button>
                            </div>
                            <p className="text-center text-sm text-muted-foreground">Already have an account? <Link to="/login" className="text-primary underline-offset-4 hover:underline">Login</Link></p>
                        </Field>
                    </FieldGroup>
                </form>
            </div>
        </div>
    );
}
