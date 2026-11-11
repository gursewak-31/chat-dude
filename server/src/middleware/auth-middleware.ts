import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import AppError from "../errors/app-errors.js";

dotenv.config();
let secret = process.env.JWT_ACCESS_SECRET;

export default function authMiddleware(req: Request, res: Response, next: NextFunction){
    if(req.url == "/auth/login" || req.url == "/auth/signup" || req.url == "/auth/refresh") return next();

    try{
        let token = req.headers.authorization;
        token = token?.split(" ")[1];

        if(!token){
            throw new AppError("Cookie not found. Please log in.", 401);
        }

        if(!secret){
            throw new AppError("JWT secret not defined.", 500);
        }

        let decoded: { id: string } = jwt.verify(token, secret) as { id: string };
        req.userId = decoded.id;

        return next();
    } catch (error) {
        return next(error);
    }
}