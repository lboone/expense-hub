import { format } from "date-fns";
import mongoose from "mongoose";
import { ReportFrequencyEnum } from "../enums/report.enum";
import { TransactionTypeEnum } from "../enums/transaction.enum";
import ReportSettingModel from "../models/report-setting.model";
import ReportModel from "../models/report.model";
import TransactionModel from "../models/transaction.model";
import { NotFoundException } from "../utils/app-error";
import { convertToDollars } from "../utils/format-currency";
import {
  calculateNextReportDate,
  calculateSavingRate,
  generateInsightsAI,
} from "../utils/helper";
import type { UpdateReportSettingType } from "../validators/report.validator";

export const getAllReportsService = async (
  userId: string,
  pagination: System.IPagination
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

export const generateReportService = async (
  userId: string,
  fromDate: Date,
  toDate: Date
) => {
  const results = await TransactionModel.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: fromDate, $lte: toDate },
      },
    },
    {
      $facet: {
        summary: [
          {
            $group: {
              _id: null,
              totalIncome: {
                $sum: {
                  $cond: [
                    { $eq: ["$type", TransactionTypeEnum.INCOME] },
                    { $abs: "$amount" },
                    0,
                  ],
                },
              },
              totalExpenses: {
                $sum: {
                  $cond: [
                    { $eq: ["$type", TransactionTypeEnum.EXPENSE] },
                    { $abs: "$amount" },
                    0,
                  ],
                },
              },
            },
          },
        ],
        categories: [
          {
            $match: { type: TransactionTypeEnum.EXPENSE },
          },
          {
            $group: {
              _id: "$category",
              total: { $sum: { $abs: "$amount" } },
            },
          },
          {
            $sort: { total: -1 },
          },
          {
            $limit: 5,
          },
        ],
      },
    },
    {
      $project: {
        totalIncome: { $arrayElemAt: ["$summary.totalIncome", 0] },
        totalExpenses: { $arrayElemAt: ["$summary.totalExpenses", 0] },
        categories: 1,
      },
    },
  ]);

  if (
    !results?.length ||
    (results[0]?.totalIncome === 0 && results[0]?.totalExpenses === 0)
  )
    return null;

  const {
    totalIncome = 0,
    totalExpenses = 0,
    categories = [],
  } = results[0] || {};

  const byCategory = categories.reduce(
    (acc: any, { _id, total }: any) => {
      acc[_id] = {
        amount: convertToDollars(total),
        percentage:
          totalExpenses > 0 ? Math.round((total / totalExpenses) * 100) : 0,
      };
      return acc;
    },
    {} as Record<string, { amount: string; percentage: number }>
  );
  const availableBalance = totalIncome - totalExpenses;
  const savingsRate = calculateSavingRate(totalIncome, totalExpenses);

  const periodLabel = `${format(fromDate, "MMMM d")} - ${format(toDate, "d, yyyy")}`;

  const insights = await generateInsightsAI({
    totalIncome,
    totalExpenses,
    availableBalance,
    savingsRate,
    categories: byCategory,
    periodLabel,
  });

  return {
    period: periodLabel,
    summary: {
      income: convertToDollars(totalIncome),
      expenses: convertToDollars(totalExpenses),
      balance: convertToDollars(availableBalance),
      savingsRate: Number(savingsRate.toFixed(1)),
      topCategories: Object.entries(byCategory)?.map(([name, cat]: any) => ({
        name,
        amount: cat.amount,
        percent: cat.percentage,
      })),
      insights,
    },
  };
};
