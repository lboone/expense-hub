import UserModel from "../models/user.model";
import {
  InternalServerException,
  UnauthorizedException,
} from "../utils/app-error";

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
