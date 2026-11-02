import type { SignupUser, LoginUser } from "../types/auth-types.js";

export function validateSignup(data: SignupUser){
    return (
        isValidName(data.name) &&
        isValidEmail(data.email) && 
        isValidPassword(data.password)
    );
}

export function validateLogin(data: LoginUser){
    return (
        isValidEmail(data.email) && 
        isValidPassword(data.password)
    );
}

function isValidName(firstName: string): boolean{
    return firstName.trim().length > 0 && /^[a-zA-Z\s]+$/.test(firstName);
}

function isValidEmail(email: string): boolean{
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPassword(password: string): boolean{
    return password.trim().length > 0 && /^.{8,32}$/.test(password);
}
