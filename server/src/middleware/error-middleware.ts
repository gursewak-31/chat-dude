import type { Request, Response, NextFunction } from "express";
import AppError from "../errors/app-errors.js";
import jwt from "jsonwebtoken";

export default function errorHandler(err: Error, req: Request, res: Response, next: NextFunction){
    console.log(err)
    if(err instanceof AppError){
        res.status(err.statusCode).json({
            success: false,
            msg: err.message
        });
        return;
    }

    if(err instanceof jwt.TokenExpiredError){
        res.status(401).json({
            success: false,
            msg: "Token expired. Please log in again."
        });
        return;
    }

    res.status(500).json({
        success: false, 
        msg: "Something went wrong. Please try again later."
    });
}