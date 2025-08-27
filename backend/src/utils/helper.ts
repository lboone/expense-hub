import type { Request } from "express";

import { createUserContent } from "@google/genai";
import {
  addDays,
  addMonths,
  addQuarters,
  addWeeks,
  addYears,
  startOfMonth,
  startOfQuarter,
  startOfWeek,
  startOfYear,
} from "date-fns";
import { genAI, genAIModel } from "../config/google-ai.config";
import { ReportFrequencyEnum } from "../enums/report.enum";
import { RecurringIntervalEnum } from "../enums/transaction.enum";
import { convertToDollars } from "./format-currency";
import { reportInsightPrompt } from "./prompt";

interface IReportDateCalculator {
  frequency: keyof typeof ReportFrequencyEnum;
  lastSentDate?: Date;
}

export const calculateNextReportDate = ({
  frequency = ReportFrequencyEnum.MONTHLY,
  lastSentDate = new Date(),
}: IReportDateCalculator): Date => {
  let nextDate;

  switch (frequency) {
    case ReportFrequencyEnum.DAILY:
      nextDate = new Date(lastSentDate.setDate(lastSentDate.getDate() + 1));
      break;
    case ReportFrequencyEnum.WEEKLY:
      nextDate = startOfWeek(addMonths(lastSentDate, 1));
      break;
    case ReportFrequencyEnum.MONTHLY:
      nextDate = startOfMonth(addMonths(lastSentDate, 1));
      break;
    case ReportFrequencyEnum.QUARTERLY:
      nextDate = startOfQuarter(addQuarters(lastSentDate, 1));
      break;
    case ReportFrequencyEnum.ANNUALLY:
      nextDate = startOfYear(addYears(lastSentDate, 1));
      break;
    default:
      throw new Error("Invalid frequency");
  }

  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
};

export function calculateNextOccurrence(
  date: Date,
  recurringInterval: keyof typeof RecurringIntervalEnum
) {
  const base = new Date(date);
  base.setHours(0, 0, 0, 0);

  switch (recurringInterval) {
    case RecurringIntervalEnum.DAILY:
      return addDays(base, 1);
      break;
    case RecurringIntervalEnum.WEEKLY:
      return addWeeks(base, 1);
      break;
    case RecurringIntervalEnum.BI_WEEKLY:
      return addWeeks(base, 2);
      break;
    case RecurringIntervalEnum.MONTHLY:
      return addMonths(base, 1);
      break;
    case RecurringIntervalEnum.YEARLY:
      return addYears(base, 1);
      break;
    default:
      return base;
  }
}

export function paginationHelper(
  req: Request,
  psDefault = 20,
  pnDefault = 1
): System.IPagination {
  const pageSize = parseInt(req.query.pageSize as string) || psDefault;
  const pageNumber = parseInt(req.query.pageNumber as string) || pnDefault;

  return {
    pageSize,
    pageNumber,
  };
}

export function calculateSavingRate(
  totalIncome: number,
  totalExpenses: number
) {
  if (totalIncome <= 0) return 0;

  const savingsRate = ((totalIncome - totalExpenses) / totalIncome) * 100;
  return parseFloat(savingsRate.toFixed(2));
}

export async function generateInsightsAI({
  totalIncome,
  totalExpenses,
  availableBalance,
  savingsRate,
  categories,
  periodLabel,
}: Report.IInsightsAI) {
  try {
    const prompt = reportInsightPrompt({
      totalIncome: convertToDollars(totalIncome),
      totalExpenses: convertToDollars(totalExpenses),
      availableBalance: convertToDollars(availableBalance),
      savingsRate,
      categories,
      periodLabel,
    });
    console.log("AI Prompt:", prompt);

    const result = await genAI.models.generateContent({
      model: genAIModel,
      contents: [createUserContent([prompt])],
      config: { responseMimeType: "application/json" },
    });

    console.log("AI Raw Response:", result);

    const response = result.text;
    console.log("AI Response:", response);

    const cleanedText = response?.replace(/```(?:json)?\n?/g, "").trim();
    console.log("AI Cleaned Text:", cleanedText);
    if (!cleanedText) return [];
    console.log("AI JSON:", JSON.parse(cleanedText));
    const data = JSON.parse(cleanedText);
    return data;
  } catch (error) {
    return [];
  }
}
