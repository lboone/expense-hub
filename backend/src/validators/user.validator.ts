import { z } from "zod";
import { emailSchema, passwordSchema } from "./auth.validator";

export const updateUserSchema = z
  .object({
    name: z.string().trim().min(1).max(255).optional(),
    email: emailSchema.optional(),
    password: passwordSchema.optional(),
    originalPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      // If password is provided, originalPassword must be provided and valid
      if (data.password) {
        return data.originalPassword && data.originalPassword.length > 0;
      }
      // If no password is provided, originalPassword is not required
      return true;
    },
    {
      message: "Original password is required when changing password",
      path: ["originalPassword"],
    }
  );

export type UpdateUserType = z.infer<typeof updateUserSchema>;
