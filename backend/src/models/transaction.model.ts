import mongoose, { Document, Schema } from "mongoose";

import {
  PaymentMethodEnum,
  RecurringIntervalEnum,
  TransactionStatusEnum,
  TransactionTypeEnum,
} from "../enums/transaction.enum";
import { convertToCents, convertToDollars } from "../utils/format-currency";

export interface TransactionDocument extends Document {
  userId: mongoose.Types.ObjectId;
  type: keyof typeof TransactionTypeEnum;
  title: string;
  amount: number;
  category: string;
  receiptUrl?: string;
  recurringInterval?: keyof typeof RecurringIntervalEnum;
  nextRecurringDate?: Date;
  lastProcessed?: Date;
  isRecurring: boolean;
  description?: string;
  date: Date;
  status: keyof typeof TransactionStatusEnum;
  paymentMethod: keyof typeof PaymentMethodEnum;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<TransactionDocument>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    title: { type: String, required: true },
    type: {
      type: String,
      enum: Object.values(TransactionTypeEnum),
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      set: (v: number) => convertToCents(v),
      get: (v: number) => convertToDollars(v),
    },
    description: { type: String },
    category: { type: String, required: true },
    receiptUrl: { type: String },
    date: { type: Date, default: Date.now },
    isRecurring: { type: Boolean, default: false },
    recurringInterval: {
      type: String,
      enum: Object.values(RecurringIntervalEnum),
      default: null,
    },
    nextRecurringDate: { type: Date },
    lastProcessed: { type: Date },
    status: {
      type: String,
      enum: Object.values(TransactionStatusEnum),
      default: TransactionStatusEnum.COMPLETED,
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethodEnum),
      default: PaymentMethodEnum.CARD,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true, getters: true },
  }
);

const TransactionModel = mongoose.model<TransactionDocument>(
  "Transaction",
  transactionSchema
);

export default TransactionModel;
