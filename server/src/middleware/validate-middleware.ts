import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import AppError from "../errors/app-errors.js";

export default function validateSchema(schema: z.ZodType){
    return  (req: Request, res: Response, next: NextFunction) => {
        let validate = schema.safeParse(req.body);

        if(!validate.success){
            throw new AppError("Invalid data. Please check your input.", 400);
        }

        req.body = validate.data; // assign the validated data to req.body, so extra fields eliminated by the schema are not passed to the controller
        next();
    }
}