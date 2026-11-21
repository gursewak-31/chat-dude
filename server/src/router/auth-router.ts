import router from "express";
import * as authController from "../controller/auth-controller.js";
import limiter from "../middleware/limiter-middleware.js";
import validateSchema from "../middleware/validate-middleware.js";
import { loginSchema, signupSchema } from "../schemas/auth-schemas.js";

const authRouter = router();

authRouter.post("/login", limiter, validateSchema(loginSchema), authController.login);

authRouter.post("/signup", validateSchema(signupSchema), authController.signup);

authRouter.get("/user", authController.getUser);

authRouter.get("/logout", authController.logout);

authRouter.get("/refresh", authController.refresh);

export default authRouter;