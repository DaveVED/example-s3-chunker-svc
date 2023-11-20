import { StatusCodes } from "http-status-codes";
import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../types/Response";
import { logger } from "../util/logger";
import { FileStorage } from "../services/fileStorageService";
import { FileUplaodResult } from "../types/Files";
import { validateFileStorageInput } from "../util/validators";

const fileStorage = new FileStorage("dev-jot-jar-users");

export const createFile = async (
  req: Request,
  res: Response<ApiResponse<FileUplaodResult>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const { formatedFilePath, buffer } = validateFileStorageInput(req);

    const file = await fileStorage.createFile(buffer, formatedFilePath);

    const response: ApiResponse<FileUplaodResult> = {
      data: file,
    };

    logger.info(`File created succesfully ${JSON.stringify(response)}`);

    res.status(StatusCodes.OK).json(response);
  } catch (error) {
    next(error);
  }
};
