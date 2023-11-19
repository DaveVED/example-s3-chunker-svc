import { StatusCodes } from "http-status-codes";
import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../types/Response";
import { status } from "../services/healthService";

export const healthCheck = async (
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction,
): Promise<void> => {
  try {
    const healthStatus = await status();

    const response: ApiResponse = {
      data: healthStatus,
    };

    res.status(StatusCodes.OK).json(response);
  } catch (error) {
    next(error);
  }
};
