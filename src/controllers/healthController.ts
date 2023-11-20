import { StatusCodes } from "http-status-codes";
import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../types/Response";
import { status } from "../services/healthService";
import { logger } from "../util/logger";
import { HeatlhStatus } from "../types/Health";

export const healthCheck = (
  req: Request,
  res: Response<ApiResponse<HeatlhStatus>>,
  next: NextFunction,
): void => {
  try {
    const healthStatus = status();

    const response: ApiResponse<HeatlhStatus> = {
      data: healthStatus,
    };

    logger.info(`Health Check Passed ${JSON.stringify(healthStatus)}`);

    res.status(StatusCodes.OK).json(response);
  } catch (error) {
    next(error);
  }
};
