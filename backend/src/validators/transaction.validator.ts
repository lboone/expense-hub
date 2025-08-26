import { z } from "zod";
import {
  PaymentMethodEnum,
  RecurringIntervalEnum,
  TransactionTypeEnum,
} from "../enums/transaction.enum";

export const transactionIdSchema = z
  .string()
  .trim()
  .min(1, "Transaction ID is required");

export const baseTransactionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum([TransactionTypeEnum.INCOME, TransactionTypeEnum.EXPENSE], {
    message: "Transaction type must be INCOME or EXPENSE",
  }),
  description: z.string().optional(),
  amount: z.number().positive("Amount must be a positive number").min(1),
  category: z.string().min(1, "Category is required"),
  date: z
    .union([
      z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date string",
      }),
      z.date(),
    ])
    .transform((val) => new Date(val)),
  isRecurring: z.boolean().default(false),
  recurringInterval: z
    .enum([
      RecurringIntervalEnum.DAILY,
      RecurringIntervalEnum.WEEKLY,
      RecurringIntervalEnum.BI_WEEKLY,
      RecurringIntervalEnum.MONTHLY,
      RecurringIntervalEnum.YEARLY,
    ])
    .nullable()
    .optional(),
  receiptUrl: z.string().optional(),
  paymentMethod: z
    .enum([
      PaymentMethodEnum.CARD,
      PaymentMethodEnum.BANK_TRANSFER,
      PaymentMethodEnum.MOBILE_PAYMENT,
      PaymentMethodEnum.AUTO_DEBIT,
      PaymentMethodEnum.CASH,
      PaymentMethodEnum.OTHER,
    ])
    .default(PaymentMethodEnum.CARD),
});

export const bulkDeleteTransactionSchema = z.object({
  transactionIds: z
    .array(z.string().length(24, "Invalid transaction ID format"))
    .min(1, "At least one transaction ID is required"),
});

export const bulkTransactionSchema = z.object({
  transactions: z
    .array(baseTransactionSchema)
    .min(1, "At least one transaction is required")
    .max(300, "At most 300 transactions are allowed")
    .refine(
      (txs) =>
        txs.every((tx) => {
          const amount = Number(tx.amount);
          return !isNaN(amount) && amount > 0 && amount < 1000000;
        }),
      {
        message:
          "Each transaction amount must be a positive number less than $1,000,000",
      }
    ),
});
export const createTransactionSchema = baseTransactionSchema;
export const updateTransactionSchema = baseTransactionSchema.partial();

export type CreateTransactionType = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionType = z.infer<typeof updateTransactionSchema>;
export type BulkDeleteTransactionType = z.infer<
  typeof bulkDeleteTransactionSchema
>;
