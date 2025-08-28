import type { Request, Response } from "express";
import HTTPSTATUS from "../config/http.config";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import {
  findByIdUserService,
  updateUserService,
} from "../services/user.service";
import { updateUserSchema } from "../validators/user.validator";

export const getCurrentUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const user = await findByIdUserService(userId);
    return res
      .status(HTTPSTATUS.OK)
      .json({ message: "User fetched successfully", data: { user } });
  }
);

export const updateUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const body = updateUserSchema.parse(req.body);
    const profilePicture = req.file;

    const user = await updateUserService(userId, body, profilePicture);
    if (!user) {
      return res
        .status(HTTPSTATUS.NOT_FOUND)
        .json({ message: "User not found", data: { user } });
    }

    return res
      .status(HTTPSTATUS.OK)
      .json({ message: "User updated successfully", data: { user } });
  }
);
