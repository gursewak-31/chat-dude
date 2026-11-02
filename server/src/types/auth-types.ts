
export interface SignupUser{
    name: string,
    email: string,
    password: string
}

export interface LoginUser{
    email: string,
    password: string
}

export interface StoredUser{
    id: string,
    name: string,
    email: string,
    createdAt: Date
}