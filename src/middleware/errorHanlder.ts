import { NextFunction, Request, Response } from "express";
import { ApiError, ApiResponse } from "../types/Response";
import { StatusCodes } from "http-status-codes";
import { CustomError } from "../util/errors";

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (error instanceof CustomError) {
    const { statusCode, errors, logging } = error;
    if (logging) {
      console.error(
        JSON.stringify(
          {
            code: error.statusCode,
            errors: error.errors,
            stack: error.stack,
          },
          null,
          2,
        ),
      );
    }

    return res.status(statusCode).send({ errors });
  }

  console.error(JSON.stringify(error, null, 2));
  return res
    .status(StatusCodes.INTERNAL_SERVER_ERROR)
    .send({ errors: [{ message: "Something went wrong" }] });
};

export default errorHandler;
