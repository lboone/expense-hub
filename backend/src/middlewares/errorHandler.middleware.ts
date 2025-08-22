import type { ErrorRequestHandler } from "express";
import HTTPSTATUS from "../config/http.config";
import { AppError } from "../utils/app-error";

const errorHandler: ErrorRequestHandler = (err, req, res, next): any => {
  console.error("Error occured on PATH:", req.path);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
      errorCode: err.errorCode,
    });
  }

  return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
    message: "Internal Server Error",
    error: err?.message || "Unknown error occurred",
  });
};

export default errorHandler;
