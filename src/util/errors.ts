import { StatusCodes } from "http-status-codes";
import { CustomErrorContent } from "../types/Response";

export abstract class CustomError extends Error {
  abstract readonly statusCode: number;
  abstract readonly errors: CustomErrorContent[];
  abstract readonly logging: boolean;

  constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

export default class FormatedRequestError extends CustomError {
  private static readonly _statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  private readonly _code: number;
  private readonly _logging: boolean;
  private readonly _context: { [key: string]: string };
  private readonly _errors: CustomErrorContent[] = [];

  constructor(params?: {
    code?: number;
    message?: string;
    logging?: boolean;
    context?: { [key: string]: string };
    errors?: CustomErrorContent[];
  }) {
    const { code, message, logging, errors } = params || {};

    super(message || "Internal Server Error.");
    this._code = code || FormatedRequestError._statusCode;
    this._logging = logging || false;
    this._context = params?.context || {};
    this._errors = errors || [];

    Object.setPrototypeOf(this, FormatedRequestError.prototype);
  }

  addError(message: string, context?: { [key: string]: string }) {
    this._errors.push({ message, context });
  }

  get errors() {
    return this._errors;
  }

  get statusCode() {
    return this._code;
  }

  get logging() {
    return this._logging;
  }
}
