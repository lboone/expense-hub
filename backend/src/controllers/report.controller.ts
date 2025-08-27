import type { Request, Response } from "express";
import HTTPSTATUS from "../config/http.config";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import {
  generateReportService,
  getAllReportsService,
  getMyReportSettingService,
  updateReportSettingService,
} from "../services/report.service";
import { paginationHelper } from "../utils/helper";
import { updateReportSettingSchema } from "../validators/report.validator";

export const getAllReportsController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const pagination = paginationHelper(req);

    const results = await getAllReportsService(userId, pagination);

    return res.status(HTTPSTATUS.OK).json({
      message: "Reports history fetched successfully",
      data: {
        ...results,
      },
    });
  }
);

export const updateReportSettingController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const body = updateReportSettingSchema.parse(req.body);

    const updatedReportSetting = await updateReportSettingService(userId, body);

    if (!updatedReportSetting) {
      return res.status(HTTPSTATUS.NOT_FOUND).json({
        message: "Report setting not found",
      });
    }
    return res.status(HTTPSTATUS.OK).json({
      message: "Report setting updated successfully",
      data: { reportSetting: updatedReportSetting },
    });
  }
);

export const getMyReportSettingController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const reportSetting = await getMyReportSettingService(userId);

    if (!reportSetting) {
      return res.status(HTTPSTATUS.NOT_FOUND).json({
        message: "Report setting not found",
      });
    }
    return res.status(HTTPSTATUS.OK).json({
      message: "Report setting retrieved successfully",
      data: { reportSetting },
    });
  }
);

export const generateReportController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { from, to } = req.query;

    const fromDate = new Date(from as string);
    const toDate = new Date(to as string);

    const report = await generateReportService(userId, fromDate, toDate);

    if (!report) {
      return res.status(HTTPSTATUS.NOT_FOUND).json({
        message: "No report created",
      });
    }
    return res.status(HTTPSTATUS.OK).json({
      message: "Report generated successfully",
      data: { report },
    });
  }
);
