import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ApiResponse } from "../types/Response";
import { CustomError } from "../util/errors";

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction, // eslint-disable-line @typescript-eslint/no-unused-vars
): void => {
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

    const response: ApiResponse = {
      errors: errors,
    };

    res.status(statusCode).send(response);
  }

  console.error(JSON.stringify(error, null, 2));
  res
    .status(StatusCodes.INTERNAL_SERVER_ERROR)
    .send({ errors: [{ message: "Something went wrong" }] });
};

export default errorHandler;
