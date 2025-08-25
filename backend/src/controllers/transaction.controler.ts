import type { Request, Response } from "express";
import HTTPSTATUS from "../config/http.config";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { createTransactionService } from "../services/transaction.service";
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
