import type { SignupUser, LoginUser } from "../types/auth-types.js";
import { validateSignup, validateLogin } from "../utils/auth-utils.js";
import * as dbActions from "../database/auth-db-actions.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import AppError from "../errors/app-errors.js";

dotenv.config();
const AccessSecret = process.env.JWT_ACCESS_SECRET;
const RefreshSecret = process.env.JWT_REFRESH_SECRET;

export async function signup(user: SignupUser){
    let isValid = validateSignup(user);

    if(!isValid){
        throw new AppError("Invalid data. Please check your input.", 400);
    }

    let existingUser = await dbActions.getUserByEmail(user.email);

    if(existingUser){
        throw new AppError("User with this email already exists.", 409);
    }

    let hashedPass = await bcrypt.hash(user.password, 12); // hash password with salt round 12

    let insertedId = await dbActions.insertUser({...user, password: hashedPass});

    return insertedId;
}

export async function login(user: LoginUser){
    let isValid = validateLogin(user);

    if(!isValid){
        throw new AppError("Invalid data. Please check your input.", 400);
    }

    let data = await dbActions.getUserByEmail(user.email);

    if(!data || !(await bcrypt.compare(user.password, data.password))){
        throw new AppError("Invalid email or password.", 401);
    }

    return data.id;
}

export async function getUser(userId: string){
    let user = await dbActions.getUserById(userId);

    return user;
}

export async function refresh(oldToken: string){
    if(!oldToken){
        throw new AppError("Cookie not found. Please log in.", 401);
    }

    if(!RefreshSecret){
        throw new AppError("JWT secret not defined.", 500);
    }

    let decoded: { id: string } = jwt.verify(oldToken, RefreshSecret) as { id: string };

    return decoded.id;
}

export function generateAccessToken(userId: string){
    if(!AccessSecret){
        throw new AppError("JWT secret not defined.", 500);
    }

    return jwt.sign({id: userId}, AccessSecret, {expiresIn: "1m"});
}

export function generateRefreshToken(userId: string){
    if(!RefreshSecret){
        throw new AppError("JWT secret not defined.", 500);
    }

    return jwt.sign({id: userId}, RefreshSecret, {expiresIn: "24h"});
}