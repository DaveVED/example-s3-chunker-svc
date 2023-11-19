import { StatusCodes } from "http-status-codes";
import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../types/Response";
import { status } from "../services/healthService";

export const healthCheck = (
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction,
): void => {
  try {
    const healthStatus = status();

    const response: ApiResponse = {
      data: healthStatus,
    };

    res.status(StatusCodes.OK).json(response);
  } catch (error) {
    next(error);
  }
};
