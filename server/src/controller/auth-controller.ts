import type { Request, Response, NextFunction } from "express";
import * as authService from "../service/auth-service.js";

export async function signup(req: Request, res: Response, next: NextFunction){
    try{
        let token = await authService.signup(req.body);
        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000
        });
        res.status(200).json({success: true, msg: "User created successfully.", token: token});
    } catch (error) {
        console.log(error);
        next(error);
    }
}

export async function login(req: Request, res: Response, next: NextFunction){
    try{
        let token = await authService.login(req.body);
        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000
        });
        res.status(200).json({success: true, msg: "User logged in successfully.", token: token});
    } catch (error) {
        next(error);
    }
}

export async function getUser(req: Request, res: Response, next: NextFunction){
    try{
        let user = await authService.getUser(req.userId);
        res.status(200).json({success: true, data: user});
    }catch(error){
        next(error);
    }
}