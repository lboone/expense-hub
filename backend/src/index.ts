import "dotenv/config";

import cors from "cors";
import type { NextFunction, Request, Response } from "express";
import express from "express";
import connectDatabase from "./config/database.config";
import Env from "./config/env.config";
import HTTPSTATUS from "./config/http.config";
import { asyncHandler } from "./middlewares/asyncHandler.middleware";
import errorHandler from "./middlewares/errorHandler.middleware";

const app = express();
const BASE_PATH = Env.BASE_PATH;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.use(errorHandler);

app.listen(Env.PORT, async () => {
  await connectDatabase();
  console.log(`Server is running on port ${Env.PORT} in ${Env.NODE_ENV} mode`);
});
