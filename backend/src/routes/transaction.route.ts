import { Router } from "express";
import {
  bulkDeleteTransactionController,
  createTransactionController,
  deleteTransactionController,
  duplicateTransactionController,
  getAllTransactionController,
  getTransactionByIdController,
  updateTransactionController,
} from "../controllers/transaction.controller";

const transactionRoutes = Router();

// Specific routes FIRST (before parameterized routes)
transactionRoutes.delete("/bulk-delete", bulkDeleteTransactionController); // Bulk delete transactions

// RESTful routes
transactionRoutes.post("/", createTransactionController); // Create transaction
transactionRoutes.get("/", getAllTransactionController); // Get all transactions
transactionRoutes.get("/:id", getTransactionByIdController); // Get specific transaction
transactionRoutes.put("/:id", updateTransactionController); // Update transaction
transactionRoutes.delete("/:id", deleteTransactionController); // Delete transaction

// Action-based routes (use POST for actions)
transactionRoutes.post("/:id/duplicate", duplicateTransactionController); // Duplicate transaction

export default transactionRoutes;
