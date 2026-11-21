import { email, z } from "zod";

let loginSchema = z.object({
    email: z.email("Invalid email address !"),
    password: z.string().trim().min(8, "Password must be atleast 8 character long !").max(32, "Password is too long !")
});

let signupSchema = z.object({
    name: z.string().trim().min(1, "Please enter valid name !"),
    email: z.email("Invalid email address !"),
    password: z.string().trim().min(8, "Password must be atleast 8 character long !").max(32, "Password is too long !")
});

export { loginSchema, signupSchema };