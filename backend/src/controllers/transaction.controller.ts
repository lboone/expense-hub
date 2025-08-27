import type { Request, Response } from "express";
import type {
  RecurringStatus,
  TransactionFilters,
  TransactionType,
} from "../@types/transaction.type";
import HTTPSTATUS from "../config/http.config";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import {
  bulkDeleteTransactionService,
  bulkTransactionService,
  createTransactionService,
  deleteTransactionService,
  duplicateTransactionService,
  getAllTransactionService,
  getTransactionByIdService,
  scanReceiptService,
  updateTransactionService,
} from "../services/transaction.service";
import { paginationHelper } from "../utils/helper";
import {
  bulkDeleteTransactionSchema,
  bulkTransactionSchema,
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
    const pagination = paginationHelper(req);
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

export const bulkDeleteTransactionController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { transactionIds } = bulkDeleteTransactionSchema.parse(req.body);

    const transactionsDeleted = await bulkDeleteTransactionService(
      userId,
      transactionIds
    );

    if (transactionsDeleted.success === false) {
      return res.status(HTTPSTATUS.NOT_FOUND).json({
        message: "Transaction not found",
      });
    }

    return res.status(HTTPSTATUS.OK).json({
      message: "Transactions deleted successfully",
      data: { deletedCount: transactionsDeleted.deletedCount },
    });
  }
);

export const bulkTransactionController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { transactions } = bulkTransactionSchema.parse(req.body);

    const results = await bulkTransactionService(userId, transactions);

    return res.status(HTTPSTATUS.OK).json({
      message: "Bulk transaction inserted successful",
      data: { ...results },
    });
  }
);

export const scanReceiptController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { file } = req;

    const result = await scanReceiptService(file);

    if (!result) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        message: "Receipt not scanned",
      });
    }

    return res.status(HTTPSTATUS.OK).json({
      message: "Receipt scanned successfully",
      data: { ...result },
    });

    // If customer has auto-create enabled, create the transaction for them.
    // const body = createTransactionSchema.parse(result);
    // const transaction = await createTransactionService(body, userId);
    // return res.status(HTTPSTATUS.CREATED).json({
    //   message: "Transaction created successfully",
    //   data: { transaction },
    // });
  }
);
