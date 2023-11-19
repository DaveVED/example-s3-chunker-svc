import { StatusCodes } from "http-status-codes";
import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../types/Response";
import { status } from "../services/healthService";
import { logger } from "../util/logger";

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

    logger.info(`Health Check Passed ${JSON.stringify(healthStatus)}`);

    res.status(StatusCodes.OK).json(response);
  } catch (error) {
    next(error);
  }
};
