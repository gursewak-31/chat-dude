import express from "express";
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRouter from './router/auth-router.js';
import appRouter from "./router/app-router.js";
import authMiddleware from './middleware/auth-middleware.js';
import errorHandler from './middleware/error-middleware.js';
import { env } from './config/env.js';

const app = express();

app.use(cors({
    credentials: true,
    origin: env.clientOrigin
}));

app.use(cookieParser());

app.use(express.json());

app.use(authMiddleware);

app.use("/auth", authRouter);

app.use("/app", appRouter);

app.use(errorHandler);

export default app;
