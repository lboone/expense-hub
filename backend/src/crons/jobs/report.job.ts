import { format } from "date-fns";
import mongoose from "mongoose";
import { ReportStatusEnum } from "../../enums/report.enum";
import { sendReportEmail } from "../../mailers/report.mailer";
import ReportSettingModel from "../../models/report-setting.model";
import ReportModel from "../../models/report.model";
import { generateReportService } from "../../services/report.service";
import {
  calculateFromToReportPeriod,
  calculateNextReportDate,
} from "../../utils/helper";

export const processReportJob = async () => {
  const now = new Date();

  let totalCount = 0;
  let processedCount = 0;
  let failedCount = 0;

  try {
    totalCount++;
    const reportSettingCursor = ReportSettingModel.find({
      isEnabled: true,
      nextReportDate: { $lte: now },
    })
      .populate<{ userId: User.IDocument }>("userId")
      .cursor();
    console.log("Running report job");

    for await (const settings of reportSettingCursor) {
      const user = settings.userId as User.IDocument;

      const { from, to } = calculateFromToReportPeriod(settings.frequency);

      if (!user) {
        console.error("User not found for settings", settings._id);
        continue;
      }

      const session = await mongoose.startSession();

      try {
        const report = await generateReportService(user.id, from, to);
        let emailSent = false;

        if (report) {
          try {
            await sendReportEmail({
              email: user.email,
              username: user.name,
              report: {
                period: report.period,
                totalIncome: report.summary.income,
                totalExpenses: report.summary.expenses,
                availableBalance: report.summary.balance,
                savingsRate: report.summary.savingsRate,
                topSpendingCategories: report.summary.topCategories,
                insights: report.summary.insights,
              },
              frequency: settings.frequency,
            });
            emailSent = true;
          } catch (error) {
            console.error(`Email failed for user: ${user.id}`, error);
          }
        }

        (await session).withTransaction(
          async () => {
            const bulkReports: any[] = [];
            const bulkSettings: any[] = [];

            if (report && emailSent) {
              bulkReports.push({
                insertOne: {
                  document: {
                    userId: user.id,
                    sentDate: now,
                    period: report.period,
                    status: ReportStatusEnum.SENT,
                    createdAt: now,
                    updatedAt: now,
                  },
                },
              });
              bulkSettings.push({
                updateOne: {
                  filter: { _id: settings._id },
                  update: {
                    $set: {
                      lastSentDate: now,
                      nextReportDate: calculateNextReportDate({
                        frequency: settings.frequency,
                        lastSentDate: now,
                      }),
                      updatedAt: now,
                    },
                  },
                },
              });
            } else {
              bulkReports.push({
                insertOne: {
                  document: {
                    userId: user.id,
                    sentDate: now,
                    period:
                      report?.period ||
                      `${format(from, "MMM d")} - ${format(to, "d, yyyy")}`,
                    status: report
                      ? ReportStatusEnum.FAILED
                      : ReportStatusEnum.NO_ACTIVITY,
                    createdAt: now,
                    updatedAt: now,
                  },
                },
              });
              bulkSettings.push({
                updateOne: {
                  filter: { _id: settings._id },
                  update: {
                    $set: {
                      lastSentDate: null,
                      nextReportDate: calculateNextReportDate({
                        frequency: settings.frequency,
                        lastSentDate: now,
                      }),
                      updatedAt: now,
                    },
                  },
                },
              });
            }
            await Promise.all([
              ReportModel.bulkWrite(bulkReports, { ordered: false }),
              ReportSettingModel.bulkWrite(bulkSettings, { ordered: false }),
            ]);
          },
          { maxCommitTimeMS: 10000 }
        );
        processedCount++;
      } catch (error) {
        console.error(`Failed to process report`, error);
        failedCount++;
      } finally {
        await session.endSession();
      }
    }
    console.log(`Processed ${processedCount} reports out of ${totalCount}.`);
    console.log(
      `Failed to process ${failedCount} reports out of ${totalCount}.`
    );

    return {
      success: true,
      processedCount,
      failedCount,
      totalCount,
    };
  } catch (error: any) {
    console.error("Error processing report job:", error);
    return {
      success: false,
      error: error?.message,
    };
  }
};
