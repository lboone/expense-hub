import type { Request, Response } from "express";
import HTTPSTATUS from "../config/http.config";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { loginService, registerService } from "../services/auth.service";
import { loginSchema, registerSchema } from "../validators/auth.validator";

export const RegisterController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = registerSchema.parse(req.body);
    const result = await registerService(body);
    return res
      .status(HTTPSTATUS.CREATED)
      .json({ message: "User registered successfully", data: result });
  }
);

export const LoginController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = loginSchema.parse(req.body);
    const result = await loginService(body);
    return res
      .status(HTTPSTATUS.OK)
      .json({ message: "User logged in successfully", data: result });
  }
);
