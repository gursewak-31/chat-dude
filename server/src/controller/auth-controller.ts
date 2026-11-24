import type { Request, Response, NextFunction } from "express";
import * as authService from "../service/auth-service.js";

export async function signup(req: Request, res: Response, next: NextFunction){
    try{
        let userId = await authService.signup(req.body);

        let accessToken = authService.generateAccessToken(userId);
        let refreshToken = authService.generateRefreshToken(userId);

        await authService.insertRefreshToken(userId, refreshToken);

        setRefreshTokenCookie(res, refreshToken);
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

        await authService.insertRefreshToken(userId, refreshToken);

        setRefreshTokenCookie(res, refreshToken);
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
        let refreshToken = req.cookies.refreshToken;
        let userId = await authService.refresh(refreshToken); // check if the refresh token is valid

        await authService.revokeRefreshToken(userId, refreshToken); // revoke the refresh token in the database

        res.clearCookie("refreshToken", {
            httpOnly: true,
            sameSite: "none",
            secure: true,
            path: "/auth"
        });
        res.status(200).json({success: true});
    }catch(error){
        next(error);
    }
}

export async function refresh(req: Request, res: Response, next: NextFunction){
    try{
        let oldRefreshToken = req.cookies.refreshToken;
        let userId = await authService.refresh(oldRefreshToken); // check if the old refresh token is valid

        let newAccessToken = authService.generateAccessToken(userId);
        let newRefreshToken = authService.generateRefreshToken(userId);

        await authService.rotateRefreshToken(userId, oldRefreshToken, newRefreshToken);

        setRefreshTokenCookie(res, newRefreshToken);
        res.status(200).json({success: true, accessToken: newAccessToken});
    }catch(error){
        next(error);
    }
}


function setRefreshTokenCookie(res: Response, refreshToken: string){
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
        path: "/auth" // means the browser only sends the refresh cookie to matching authentication routes, rather than every endpoint
    });
}