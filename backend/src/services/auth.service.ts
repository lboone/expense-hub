import mongoose from "mongoose";
import { ReportFrequencyEnum } from "../enums/report.enum";
import ReportSettingModel from "../models/report-setting.model";
import UserModel from "../models/user.model";
import {
  InternalServerException,
  UnauthorizedException,
} from "../utils/app-error";
import { calculateNextReportDate } from "../utils/helper";
import type {
  LoginSchemaType,
  RegisterSchemaType,
} from "../validators/auth.validator";

import { signJwtToken } from "../utils/jwt";

export const registerService = async (
  body: RegisterSchemaType
): Promise<User.IRegisterResult> => {
  const { email } = body;
  const session = await mongoose.startSession();
  try {
    const result = await session.withTransaction(async () => {
      const existingUser = await UserModel.findOne({ email }).session(session);

      if (existingUser) throw new UnauthorizedException("User already exists");

      const newUser = new UserModel({
        ...body,
      });

      await newUser.save({ session });

      const reportSetting = new ReportSettingModel({
        userId: newUser._id,
        frequency: ReportFrequencyEnum.MONTHLY,
        isEnabled: true,
        lastSentDate: null,
        nextReportDate: calculateNextReportDate({
          frequency: ReportFrequencyEnum.MONTHLY,
        }),
      });

      await reportSetting.save({ session });

      return { user: newUser.omitPassword() };
    });
    return result;
  } catch (error) {
    console.error("Register User Error:", error);
    throw error;
  } finally {
    await session.endSession();
  }
};

export const loginService = async (
  body: LoginSchemaType
): Promise<User.ILoginResult> => {
  const { email, password } = body;
  try {
    const user = await UserModel.findOne({ email });
    if (!user) throw new UnauthorizedException("Invalid email or password");

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new UnauthorizedException("Invalid email or password");

    const { token, expiresAt } = signJwtToken({ userId: user.id });

    const reportSetting = await ReportSettingModel.findOne(
      {
        userId: user.id,
      },
      { _id: 1, frequency: 1, isEnabled: 1 }
    ).lean();

    if (!reportSetting)
      throw new InternalServerException("Internal Server Error");

    return {
      user: user.omitPassword(),
      accessToken: token,
      expiresAt: expiresAt,
      reportSetting,
    };
  } catch (error) {
    console.error("Login User Error:", error);
    throw new InternalServerException("Internal Server Error");
  }
};
