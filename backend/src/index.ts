import cors from "cors";
import "dotenv/config";
import type { NextFunction, Request, Response } from "express";
import express from "express";
import passport from "passport";
import connectDatabase from "./config/database.config";
import Env from "./config/env.config";
import HTTPSTATUS from "./config/http.config";
import "./config/passport.config";
import { passportAuthenticatedJwt } from "./config/passport.config";
import { initializeCrons } from "./crons";
import { asyncHandler } from "./middlewares/asyncHandler.middleware";
import errorHandler from "./middlewares/errorHandler.middleware";
import analyticsRoutes from "./routes/analytics.route";
import authRoutes from "./routes/auth.route";
import reportRoutes from "./routes/report.route";
import transactionRoutes from "./routes/transaction.route";
import userRoutes from "./routes/user.route";

const app = express();
const BASE_PATH = Env.BASE_PATH;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());

app.use(
  cors({
    origin: Env.FRONTEND_ORIGIN,
    credentials: true,
  })
);

app.get(
  "/",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    res.status(HTTPSTATUS.OK).json({ message: "Expense Hub API is running" });
  })
);

app.use(`${BASE_PATH}/auth`, authRoutes);
app.use(`${BASE_PATH}/user`, passportAuthenticatedJwt, userRoutes);
app.use(
  `${BASE_PATH}/transaction`,
  passportAuthenticatedJwt,
  transactionRoutes
);
app.use(`${BASE_PATH}/report`, passportAuthenticatedJwt, reportRoutes);
app.use(`${BASE_PATH}/analytics`, passportAuthenticatedJwt, analyticsRoutes);

app.use(errorHandler);

app.listen(Env.PORT, async () => {
  await connectDatabase();
  if (Env.NODE_ENV === "development") {
    await initializeCrons();
  }
  console.log(`Server is running on port ${Env.PORT} in ${Env.NODE_ENV} mode`);
});
