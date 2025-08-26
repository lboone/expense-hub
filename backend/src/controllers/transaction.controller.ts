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
  deleteTransactionService,
  duplicateTransactionService,
  getAllTransactionService,
  getTransactionByIdService,
  updateTransactionService,
} from "../services/transaction.service";
import {
  createTransactionSchema,
  transactionIdSchema,
  updateTransactionSchema,
} from "../validators/transaction.validator";

export const createTransactionController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = createTransactionSchema.parse(req.body);
    const userId = req.user?._id;

    const transaction = await createTransactionService(body, userId);
    return res.status(HTTPSTATUS.CREATED).json({
      message: "Transaction created successfully",
      data: { transaction },
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

    if (!transactions.transactions.length) {
      return res.status(HTTPSTATUS.NOT_FOUND).json({
        message: "No transactions found",
      });
    }
    return res.status(HTTPSTATUS.OK).json({
      message: "Transactions retrieved successfully",
      data: transactions,
    });
  }
);

export const getTransactionByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const transactionId = transactionIdSchema.parse(req.params.id);

    const transaction = await getTransactionByIdService(userId, transactionId);

    if (!transaction) {
      return res.status(HTTPSTATUS.NOT_FOUND).json({
        message: "Transaction not found",
      });
    }

    return res.status(HTTPSTATUS.OK).json({
      message: "Transaction retrieved successfully",
      data: { transaction },
    });
  }
);

export const duplicateTransactionController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const transactionId = transactionIdSchema.parse(req.params.id);
    const transaction = await duplicateTransactionService(
      userId,
      transactionId
    );
    if (!transaction) {
      return res.status(HTTPSTATUS.NOT_FOUND).json({
        message: "Transaction not found",
      });
    }

    return res.status(HTTPSTATUS.OK).json({
      message: "Transaction duplicated successfully",
      data: { transaction },
    });
  }
);

export const updateTransactionController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const transactionId = transactionIdSchema.parse(req.params.id);
    const body = updateTransactionSchema.parse(req.body);

    const updatedTransaction = await updateTransactionService(
      userId,
      transactionId,
      body
    );

    if (!updatedTransaction) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        message: "Transaction not updated",
      });
    }

    return res.status(HTTPSTATUS.OK).json({
      message: "Transaction updated successfully",
      data: { transaction: updatedTransaction },
    });
  }
);

export const deleteTransactionController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const transactionId = transactionIdSchema.parse(req.params.id);

    const deletedTransaction = await deleteTransactionService(
      userId,
      transactionId
    );

    if (!deletedTransaction) {
      return res.status(HTTPSTATUS.NOT_FOUND).json({
        message: "Transaction not found",
      });
    }

    return res.status(HTTPSTATUS.OK).json({
      message: "Transaction deleted successfully",
      data: { transaction: deletedTransaction },
    });
  }
);
