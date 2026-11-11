import type { Request, Response, NextFunction } from "express";
import * as authService from "../service/auth-service.js";

export async function signup(req: Request, res: Response, next: NextFunction){
    try{
        let userId = await authService.signup(req.body);

        let accessToken = authService.generateAccessToken(userId);
        let refreshToken = authService.generateRefreshToken(userId);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000,
            path: "/auth" // means the browser only sends the refresh cookie to matching authentication routes, rather than every endpoint
        });
        res.status(200).json({success: true, msg: "User created successfully.", accessToken: accessToken});
    } catch (error) {
        next(error);
    }
}

export async function login(req: Request, res: Response, next: NextFunction){
    try{
        let userId = await authService.login(req.body);

        let accessToken = authService.generateAccessToken(userId);
        let refreshToken = authService.generateRefreshToken(userId);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000,
            path: "/auth" // means the browser only sends the refresh cookie to matching authentication routes, rather than every endpoint
        });
        res.status(200).json({success: true, msg: "User logged in successfully.", accessToken: accessToken});
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

export async function logout(req: Request, res: Response, next: NextFunction){
    try{
        res.clearCookie("token");
        res.status(200).json({success: true});
    }catch(error){
        next(error);
    }
}

export async function refresh(req: Request, res: Response, next: NextFunction){
    try{
        let oldToken = req.cookies.refreshToken;
        let userId = await authService.refresh(oldToken);

        let accessToken = authService.generateAccessToken(userId);

        res.status(200).json({success: true, accessToken: accessToken});
    }catch(error){
        next(error);
    }
}