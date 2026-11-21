import type { SignupUser, LoginUser } from "../types/auth-types.js";
import * as dbActions from "../database/auth-db-actions.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import crypto from "crypto";
import AppError from "../errors/app-errors.js";

dotenv.config();
const AccessSecret = process.env.JWT_ACCESS_SECRET;

export async function signup(user: SignupUser){

    let existingUser = await dbActions.getUserByEmail(user.email);

    if(existingUser){
        throw new AppError("User with this email already exists.", 409);
    }

    let hashedPass = await bcrypt.hash(user.password, 12); // hash password with salt round 12

    let insertedId = await dbActions.insertUser({...user, password: hashedPass});

    return insertedId;
}

export async function login(user: LoginUser){

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

export async function refresh(refreshToken: string){
    if(!refreshToken){
        throw new AppError("Cookie not found. Please log in.", 401);
    }

    // hash refresh token again to compare with hashed token stored in database
    refreshToken = crypto.createHash("sha256").update(refreshToken).digest("hex");

    let tokenData = await dbActions.getRefreshToken(refreshToken); // check if the refresh token exists in the database AND is not expired or revoked

    if(!tokenData){
        throw new AppError("Invalid refresh token. Please log in.", 401);
    }

    return tokenData.user_id;
}

export async function insertRefreshToken(userId: string, refreshToken: string){
    // hash refresh token before store it into database
    refreshToken = crypto.createHash("sha256").update(refreshToken).digest("hex");

    let insertedId = await dbActions.insertRefreshToken(userId, refreshToken);

    if(!insertedId){
        throw new AppError("Failed to insert refresh token.", 500);
    }

    return insertedId;
}

export function generateAccessToken(userId: string){
    if(!AccessSecret){
        throw new AppError("JWT secret not defined.", 500);
    }

    return jwt.sign({id: userId}, AccessSecret, {expiresIn: "5m"});
}

export function generateRefreshToken(userId: string){
    // generate a random string for refresh token instead of using JWT, as refresh tokens are long-lived and don't need to be decoded
    return crypto.randomBytes(64).toString("hex"); 
}

export async function revokeRefreshToken(userId: string, refreshToken: string){
    refreshToken = crypto.createHash("sha256").update(refreshToken).digest("hex");

    let revoked = await dbActions.revokeRefreshToken(userId, refreshToken);

    if(!revoked){
        throw new AppError("Failed to revoke refresh token.", 500);
    }

    return revoked;
}

export async function rotateRefreshToken(userId: string, oldRefreshToken: string, newRefreshToken: string){
    // hash refresh token before store it into database
    newRefreshToken = crypto.createHash("sha256").update(newRefreshToken).digest("hex");
    oldRefreshToken = crypto.createHash("sha256").update(oldRefreshToken).digest("hex");

    let rotate = await dbActions.rotateRefreshToken(userId, oldRefreshToken, newRefreshToken);

    if(!rotate){
        throw new AppError("Failed to rotate refresh token.", 500);
    }

    return rotate;
}
