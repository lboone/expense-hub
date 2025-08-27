import { z } from "zod";
import { ReportFrequencyEnum } from "../enums/report.enum";
export const reportSettingSchema = z.object({
  isEnabled: z.boolean().default(false),
  frequency: z
    .enum([
      ReportFrequencyEnum.DAILY,
      ReportFrequencyEnum.WEEKLY,
      ReportFrequencyEnum.MONTHLY,
      ReportFrequencyEnum.QUARTERLY,
      ReportFrequencyEnum.ANNUALLY,
    ])
    .default(ReportFrequencyEnum.MONTHLY),
});

export const updateReportSettingSchema = reportSettingSchema.partial();

export type UpdateReportSettingType = z.infer<typeof updateReportSettingSchema>;
