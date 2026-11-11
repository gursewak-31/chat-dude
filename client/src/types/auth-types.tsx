import type React from "react"

export interface SignupData{
    name: string,
    email: string,
    password: string
}

export interface LoginData{
    email: string,
    password: string
}

export interface User{
    id: string,
    name: string,
    email: string,
    createdAt: Date
}

export interface UserContext{
    user: User | null,
    setUser: React.Dispatch<React.SetStateAction<User | null>>
}

export interface TokenContext{
    token: string,
    setToken: React.Dispatch<React.SetStateAction<string>>
}