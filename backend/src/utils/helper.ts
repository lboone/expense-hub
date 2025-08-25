import {
  addMonths,
  addQuarters,
  addYears,
  startOfMonth,
  startOfQuarter,
  startOfWeek,
  startOfYear,
} from "date-fns";
import { ReportFrequencyEnum } from "../enums/report.enum";

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
