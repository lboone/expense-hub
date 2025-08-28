import { differenceInDays, subDays, subYears } from "date-fns";
import mongoose from "mongoose";
import { DateRangeEnum } from "../enums/date-range.enum";
import { TransactionTypeEnum } from "../enums/transaction.enum";
import TransactionModel from "../models/transaction.model";
import { getDateRange } from "../utils/date";
import { convertToDollars } from "../utils/format-currency";
import { calculatePercentageChange } from "../utils/helper";

export const summaryAnalyticsService = async (
  userId: string,
  dateRangePreset?: Analytics.DateRangePreset,
  customFrom?: Date,
  customTo?: Date
) => {
  const range = getDateRange(dateRangePreset, customFrom, customTo);

  const { from, to, value: rangeValue, label: rangeLabel } = range;

  const currentPeriodPipeline: any[] = [
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        ...(from &&
          to && {
            date: {
              $gte: from,
              $lte: to,
            },
          }),
      },
    },
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
        transactionCount: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: null,
        totalIncome: 1,
        totalExpenses: 1,
        transactionCount: 1,
        availableBalance: { $subtract: ["$totalIncome", "$totalExpenses"] },
        savingData: {
          $let: {
            vars: {
              income: { $ifNull: ["$totalIncome", 0] },
              expenses: { $ifNull: ["$totalExpenses", 0] },
            },
            in: {
              // ((income - expenses) / income) * 100;
              savingPercentage: {
                $cond: [
                  { $lte: ["$$income", 0] },
                  0,
                  {
                    $multiply: [
                      {
                        $divide: [
                          {
                            $subtract: ["$$income", "$$expenses"],
                          },
                          "$$income",
                        ],
                      },
                      100,
                    ],
                  },
                ],
              },
              // (expenses / income) * 100;
              expenseRatio: {
                $cond: [
                  { $lte: ["$$income", 0] },
                  0,
                  {
                    $multiply: [
                      {
                        $divide: ["$$expenses", "$$income"],
                      },
                      100,
                    ],
                  },
                ],
              },
            },
          },
        },
      },
    },
  ];

  const [current] = await TransactionModel.aggregate(currentPeriodPipeline);

  if (!current) {
    throw new Error("No transaction data found for that period.");
  }
  const {
    totalIncome = 0,
    totalExpenses = 0,
    availableBalance = 0,
    transactionCount = 0,
    savingData = {
      expenseRatio: 0,
      savingsPercentage: 0,
    },
  } = current || {};

  let percentageChange: any = {
    income: 0,
    expenses: 0,
    balance: 0,
    prevPeriodFrom: null,
    prevPeriodTo: null,
    previousValues: {
      incomeAmount: 0,
      expenseAmount: 0,
      balanceAmount: 0,
    },
  };

  if (from && to && rangeValue !== DateRangeEnum.ALL_TIME) {
    const period = differenceInDays(to, from) + 1;
    const isYearly = [
      DateRangeEnum.LAST_YEAR,
      DateRangeEnum.THIS_YEAR,
    ].includes(rangeValue);

    const prevPeriodFrom = isYearly ? subYears(from, 1) : subDays(from, period);
    const prevPeriodTo = isYearly ? subYears(to, 1) : subDays(to, period);

    const prevPeriodPipeline = [
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: {
            $gte: prevPeriodFrom,
            $lte: prevPeriodTo,
          },
        },
      },
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
    ];

    const [previous] = await TransactionModel.aggregate(prevPeriodPipeline);

    if (previous) {
      const prevIncome = previous.totalIncome || 0;
      const prevExpenses = previous.totalExpenses || 0;
      const prevBalance = prevIncome - prevExpenses;
      const currentIncome = totalIncome;
      const currentExpenses = totalExpenses;
      const currentBalance = availableBalance;

      percentageChange = {
        income: calculatePercentageChange(prevIncome, currentIncome),
        expenses: calculatePercentageChange(prevExpenses, currentExpenses),
        balance: calculatePercentageChange(prevBalance, currentBalance),
        prevPeriodFrom,
        prevPeriodTo,
        previousValues: {
          incomeAmount: prevIncome,
          expenseAmount: prevExpenses,
          balanceAmount: prevBalance,
        },
      };
    }
  }

  return {
    availableBalance: convertToDollars(availableBalance),
    totalIncome: convertToDollars(totalIncome),
    totalExpenses: convertToDollars(totalExpenses),
    transactionCount,
    savingRate: {
      expenseRatio: parseFloat(savingData.expenseRatio.toFixed(2)),
      percentage: parseFloat(savingData.savingPercentage.toFixed(2)),
    },
    percentageChange: {
      ...percentageChange,
      previousValues: {
        incomeAmount: convertToDollars(
          percentageChange.previousValues.incomeAmount
        ),
        expenseAmount: convertToDollars(
          percentageChange.previousValues.expenseAmount
        ),
        balanceAmount: convertToDollars(
          percentageChange.previousValues.balanceAmount
        ),
      },
    },
    preset: {
      ...range,
      value: rangeValue || DateRangeEnum.ALL_TIME,
      label: range?.label || "All Time",
    },
  };
};
