import { z } from "zod"

const passwordSchema = z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one digit")

export const loginSchema = z.object({
    email: z
        .string()
        .trim()
        .email("Invalid email format"),
    password: passwordSchema,
    });

    
export const signupSchema = z.object({
    name: z.string().trim().min(1, "Name is required"),
    email: z
        .string()
        .trim()
        .email("Invalid email format"),
    password: passwordSchema,
});