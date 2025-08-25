import type { Request, Response } from "express";
import type {
  RecurringStatus,
  TransactionFilters,
  TransactionPagination,
  TransactionType,
} from "../@types/transaction.type";
import HTTPSTATUS from "../config/http.config";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import {
  createTransactionService,
  getAllTransactionService,
} from "../services/transaction.service";
import { createTransactionSchema } from "../validators/transaction.validator";

export const createTransactionController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = createTransactionSchema.parse(req.body);
    const userId = req.user?._id;

    const transaction = await createTransactionService(body, userId);
    return res.status(HTTPSTATUS.CREATED).json({
      message: "Transaction created successfully",
      data: transaction,
    });
  }
);

export const getAllTransactionController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const filters: TransactionFilters = {
      keyword: req.query.keyword as string,
      type: req.query.type as TransactionType,
      recurringStatus: req.query.recurringStatus as RecurringStatus,
    };
    const pagination: TransactionPagination = {
      pageSize: parseInt(req.query.pageSize as string) || 20,
      pageNumber: parseInt(req.query.pageNumber as string) || 1,
    };
    const transactions = await getAllTransactionService(
      userId,
      filters,
      pagination
    );
    return res.status(HTTPSTATUS.OK).json({
      message: "Transactions retrieved successfully",
      data: transactions,
    });
  }
);
