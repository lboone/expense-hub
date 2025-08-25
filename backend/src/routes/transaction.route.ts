import { Router } from "express";
import {
  createTransactionController,
  duplicateTransactionController,
  getAllTransactionController,
  getTransactionByIdController,
} from "../controllers/transaction.controller";

const transactionRoutes = Router();

transactionRoutes.post("/create", createTransactionController);
transactionRoutes.get("/all", getAllTransactionController);
transactionRoutes.get("/:id", getTransactionByIdController);
transactionRoutes.put("/:id/duplicate", duplicateTransactionController);

export default transactionRoutes;
