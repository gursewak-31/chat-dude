import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { signup } from "../api/auth-api";

export default function SignUp() {
    const [isShowPass, setIsShowPass] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [invalidField, setInvalidField] = useState({ name: "", email: "", password: "" });
    const [response, setResponse] = useState("");
    const redirect = useNavigate();

    async function handleSignup(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!validate()) return;

        const res = await signup({name: name, email: email, password: password });
        if (res.success) {
            redirect("/");
            return;
        }
        setResponse(res.msg);
    }

    function validate() {
        const errors = { name: "", email: "", password: "" };
        if (!/^[a-zA-Z\s]+$/.test(name.trim())) {
            errors.name = "Name should contain only letters.";
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = "Please enter a valid email address.";
        }
        if (!/^.{8,32}$/.test(password.trim())) {
            errors.password = "Password must be 8 to 32 characters long.";
        }
        setInvalidField(errors);
        return !errors.name && !errors.email && !errors.password;
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

                <form onSubmit={handleSignup}>
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="name">Name</FieldLabel>
                            <Input id="name" type="text" autoComplete="name" placeholder="Your name" value={name} aria-invalid={!!invalidField.name} onChange={(event) => {
                                setName(event.target.value);
                                setInvalidField((prev) => ({ ...prev, name: "" }));
                            }} />
                            {invalidField.name && <span className="text-xs text-destructive">* {invalidField.name}</span>}
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="email">Email</FieldLabel>
                            <Input id="email" type="email" autoComplete="email" placeholder="example@gmail.com" value={email} aria-invalid={!!invalidField.email} onChange={(event) => {
                                setEmail(event.target.value);
                                setInvalidField((prev) => ({ ...prev, email: "" }));
                            }} />
                            {invalidField.email && <span className="text-xs text-destructive">* {invalidField.email}</span>}
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="password">Password</FieldLabel>
                            <div className="relative">
                                <Input id="password" type={isShowPass ? "text" : "password"} autoComplete="new-password" placeholder="At least 8 characters" value={password} aria-invalid={!!invalidField.password} onChange={(event) => {
                                    setPassword(event.target.value);
                                    setInvalidField((prev) => ({ ...prev, password: "" }));
                                }} />
                                <button className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer" type="button" aria-label={isShowPass ? "Hide password" : "Show password"} onClick={() => setIsShowPass((shown) => !shown)}>
                                    {isShowPass ? <FaEye /> : <FaEyeSlash />}
                                </button>
                            </div>
                            {invalidField.password && <span className="text-xs text-destructive">* {invalidField.password}</span>}
                        </Field>

                        {response && <span role="alert" className="px-2 text-xs text-destructive">* {response}</span>}

                        <Field className="items-center justify-center">
                            <Button type="submit">Sign Up</Button>
                            <p className="mt-2 text-sm text-muted-foreground">Already have an account? <Link to="/login" className="text-primary underline-offset-4 hover:underline">Login</Link></p>
                        </Field>
                    </FieldGroup>
                </form>
            </div>
        </div>
    );
}
