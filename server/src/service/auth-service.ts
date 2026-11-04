import type { SignupUser, LoginUser } from "../types/auth-types.js";
import { validateSignup, validateLogin } from "../utils/auth-utils.js";
import * as dbActions from "../database/auth-db-actions.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
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

    let existingUser = await dbActions.getUserByEmail(user.email);

    if(existingUser){
        throw new AppError("User with this email already exists.", 409);
    }

    let hashedPass = await bcrypt.hash(user.password, 12); // hash password with salt round 12

    let insertedId = await dbActions.insertUser({...user, password: hashedPass});

    let token = jwt.sign({id: insertedId}, secret, {expiresIn: "24h"});

    return token;
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

    if(!secret){
        throw new AppError("JWT secret not defined.", 500);
    }

    let token = jwt.sign({id: data.id}, secret, {expiresIn: "24h"});
    return token;
}

export async function getUser(userId: string){
    let user = await dbActions.getUserById(userId);

    return user;
}