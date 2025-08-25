import { z } from "zod";

export const emailSchema = z
  .email("Invalid email address")
  .trim()
  .min(5)
  .max(255);

export const passwordSchema = z
  .string()
  .trim()
  .min(10, "Password must be at least 10 characters long")
  .max(128, "Password must not exceed 128 characters")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character")
  .refine(
    (password) => {
      // Check for common patterns to avoid
      const commonPatterns = [
        /(.)\1{2,}/, // Three or more consecutive identical characters
        /123456|654321|abcdef|qwerty|password|admin|user/i, // Common sequences
      ];
      return !commonPatterns.some((pattern) => pattern.test(password));
    },
    {
      message: "Password contains common patterns and is not secure enough",
    }
  )
  .refine(
    (password) => {
      // Ensure password doesn't start or end with whitespace
      return password === password.trim();
    },
    {
      message: "Password cannot start or end with whitespace",
    }
  );

export const registerSchema = z.object({
  name: z.string().trim().min(1).max(255),
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type RegisterSchemaType = z.infer<typeof registerSchema>;
export type LoginSchemaType = z.infer<typeof loginSchema>;
