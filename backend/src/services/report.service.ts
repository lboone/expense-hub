import { ReportFrequencyEnum } from "../enums/report.enum";
import ReportSettingModel from "../models/report-setting.model";
import ReportModel from "../models/report.model";
import { NotFoundException } from "../utils/app-error";
import { calculateNextReportDate } from "../utils/helper";
import type { UpdateReportSettingType } from "../validators/report.validator";

export const getAllReportsService = async (
  userId: string,
  pagination: Express.IPagination
) => {
  const { pageSize, pageNumber } = pagination;
  const query: Record<string, any> = { userId };
  const skip = (pageNumber - 1) * pageSize;

  const [reports, totalCount] = await Promise.all([
    ReportModel.find(query).skip(skip).limit(pageSize).sort({ createdAt: -1 }),
    ReportModel.countDocuments(query),
  ]);
  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    reports,
    pagination: {
      pageSize,
      pageNumber,
      totalCount,
      totalPages,
      skip,
    },
  };
};

export const updateReportSettingService = async (
  userId: string,
  body: UpdateReportSettingType
) => {
  const { isEnabled, frequency } = body;
  let nextReportDate: Date | null = null;

  const existingReportSetting = await ReportSettingModel.findOne({
    userId,
  });

  if (!existingReportSetting) {
    throw new NotFoundException("Report setting not found");
  }

  if (isEnabled) {
    const currentNextReportDate = existingReportSetting.nextReportDate;
    const now = new Date();
    const lastSentDate = existingReportSetting.lastSentDate || new Date();
    const reportFrequency =
      frequency ||
      existingReportSetting.frequency ||
      ReportFrequencyEnum.MONTHLY;
    if (!currentNextReportDate || currentNextReportDate <= now) {
      nextReportDate = calculateNextReportDate({
        frequency: reportFrequency,
        lastSentDate,
      });
    } else {
      nextReportDate = currentNextReportDate;
    }
  }
  existingReportSetting.set({
    ...body,
    nextReportDate,
  });

  await existingReportSetting.save();
  return existingReportSetting;
};

export const getMyReportSettingService = async (userId: string) => {
  const reportSetting = await ReportSettingModel.findOne({
    userId,
  });
  if (!reportSetting) throw new NotFoundException("Report setting not found");
  return reportSetting;
};
