import { Request } from "express";
import { StatusCodes } from "http-status-codes";
import { ValidatedFileStorageInput } from "../types/Files";
import FormattedRequestError from "./errors";

export const validateFileStorageInput = (
  req: Request,
): ValidatedFileStorageInput => {
  const errors: FormattedRequestError = new FormattedRequestError({
    logging: true,
    code: StatusCodes.BAD_REQUEST,
  });

  let user: string = "";
  let formatedFilePath: string = "";
  let originalName: string = "";
  let buffer: Buffer = Buffer.from([]);

  req.file ?? errors.addError("Invalid Request Input - {file} is required.");

  req.body.filePath ??
    errors.addError("Invalid Request Input - {filePath} is required.");

  req.body.user ??
    errors.addError("Invalid Request Input - {user} is required.");

  if (
    req.file &&
    req.body.user &&
    req.body.filePath &&
    req.file.originalname &&
    req.file.buffer
  ) {
    const filePath = req.body.filePath as string; // Explicit type assertion

    user = req.body.user;
    originalName = req.file.originalname;
    buffer = req.file.buffer;

    formatedFilePath = formatFilepath(user, originalName, filePath);

    if (!isFileValidPath(formatedFilePath)) {
      errors.addError(
        `Invalid {filePath} after formatting ${formatedFilePath}`,
      );
    }
  }

  if (errors.errors.length > 0) {
    throw errors;
  }

  return { user, formatedFilePath, originalName, buffer };
};

export const isFileValidPath = (path: string): boolean => {
  if (typeof path !== "string" || path.length === 0) {
    return false;
  }

  if (path.startsWith("/") || path.endsWith("/")) {
    return false;
  }

  const validCharsRegex = /^[a-zA-Z0-9/_.-]+$/;
  if (!validCharsRegex.test(path)) {
    return false;
  }

  if (path.length > 1024) {
    return false;
  }

  return true;
};

export const formatFilepath = (
  user: string,
  fileName: string,
  filePath: string,
): string => {
  if (filePath === ".") {
    filePath = `${user}/${fileName}`;
  } else {
    if (filePath.startsWith("/")) {
      filePath = filePath.substring(1);
    }

    if (filePath.endsWith("/")) {
      filePath = filePath.substring(0, filePath.length - 1);
    }

    filePath = `${user}/${filePath}/${fileName}`;
  }

  return filePath;
};
