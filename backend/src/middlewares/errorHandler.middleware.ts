import type { ErrorRequestHandler, Response } from "express";
import { ZodError } from "zod";
import HTTPSTATUS from "../config/http.config";
import ErrorCodeEnum from "../enums/error-code.enum";
import { AppError } from "../utils/app-error";

const formatZodError = (res: Response, error: ZodError) => {
  const errors = error?.issues?.map((err) => ({
    field: err.path.join("."),
    message: err.message,
  }));
  return res.status(HTTPSTATUS.BAD_REQUEST).json({
    message: "Validation failed",
    errors: errors,
    errorCode: ErrorCodeEnum.VALIDATION_ERROR,
  });
};

const errorHandler: ErrorRequestHandler = (err, req, res, next): any => {
  console.error("Error occured on PATH:", req.path, "Error:", err);

  if (err instanceof ZodError) {
    return formatZodError(res, err);
  }
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
