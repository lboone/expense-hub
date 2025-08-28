import { Router } from "express";

import { upload } from "../config/cloudinary.config";
import {
  getCurrentUserController,
  updateUserController,
} from "../controllers/user.controller";

const userRoutes = Router();

userRoutes.put("/", upload.single("profilePicture"), updateUserController);
userRoutes.get("/me", getCurrentUserController);

export default userRoutes;
