import UserModel from "../models/user.model";
import {
  InternalServerException,
  UnauthorizedException,
} from "../utils/app-error";
import type { UpdateUserType } from "../validators/user.validator";

export const findByIdUserService = async (userId: string) => {
  try {
    const user = await UserModel.findById(userId);
    if (!user) throw new UnauthorizedException("User not found");
    return user.omitPassword();
  } catch (error) {
    console.error("Find User By ID Error:", error);
    throw new InternalServerException("Internal Server Error");
  }
};

export const updateUserService = async (
  userId: string,
  body: UpdateUserType,
  profilePicture?: Express.Multer.File
) => {
  const user = await UserModel.findById(userId);
  if (!user) throw new UnauthorizedException("User not found");
  if (profilePicture) {
    console.log("Profile Picture Path:", profilePicture.path);
    user.set({
      profilePicture: profilePicture.path,
    });
  }
  if (body.name) {
    user.set({
      name: body.name,
    });
  }
  if (body.email) {
    user.set({
      email: body.email,
    });
  }
  if (body.password) {
    const isMatch = await user.comparePassword(body.originalPassword!);
    if (!isMatch) throw new UnauthorizedException("Invalid email or password");
    user.set({
      password: body.password,
    });
  }

  await user.save();
  return user.omitPassword();
};
