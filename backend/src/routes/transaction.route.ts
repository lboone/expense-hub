import { Router } from "express";
import {
  createTransactionController,
  getAllTransactionController,
  getTransactionByIdController,
} from "../controllers/transaction.controller";

const transactionRoutes = Router();

transactionRoutes.post("/create", createTransactionController);
transactionRoutes.get("/all", getAllTransactionController);
transactionRoutes.get("/:id", getTransactionByIdController);

export default transactionRoutes;
