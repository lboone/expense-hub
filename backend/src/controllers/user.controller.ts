import type { Request, Response } from "express";
import HTTPSTATUS from "../config/http.config";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { findByIdUserService } from "../services/user.service";

export const getCurrentUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const user = await findByIdUserService(userId);
    return res
      .status(HTTPSTATUS.OK)
      .json({ message: "User fetched successfully", data: user });
  }
);
