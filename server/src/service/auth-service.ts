import type { SignupUser, LoginUser } from "../types/auth-types.js";
import { validateSignup, validateLogin } from "../utils/auth-utils.js";
import * as dbActions from "../database/auth-db-actions.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import AppError from "../errors/app-errors.js";

dotenv.config();
const secret = process.env.JWT_SECRET;

export async function signup(user: SignupUser){
    let isValid = validateSignup(user);

    if(!isValid){
        throw new AppError("Invalid data. Please check your input.", 400);
    }

    if(!secret){
        throw new AppError("JWT secret not defined.", 500);
    }

    let insertedId = await dbActions.insertUser(user);

    let token = jwt.sign({id: insertedId}, secret);

    return token;
}

export async function login(user: LoginUser){
    let isValid = validateLogin(user);

    if(!isValid){
        throw new AppError("Invalid data. Please check your input.", 400);
    }

    let data = await dbActions.getUserByEmail(user.email);

    if(!data || data.password !== user.password){
        throw new AppError("Invalid email or password.", 404);
    }

    if(!secret){
        throw new AppError("JWT secret not defined.", 500);
    }

    let token = jwt.sign({id: data.id}, secret);
    return token;
}

export async function getUser(userId: string){
    let user = await dbActions.getUserById(userId);

    return user;
}