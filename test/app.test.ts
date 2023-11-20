import app from "../src/app";
import request from "supertest";
import { StatusCodes } from "http-status-codes";
import * as healthService from "../src/services/healthService";
import { ApiResponse, CustomErrorContent } from "../src/types/Response";
import FormattedRequestError, { CustomError } from "../src/util/errors";
import { HeatlhStatus } from "../src/types/Health";
import fs from "fs";
import { FileUploadResult } from "../src/types/Files";

describe("GET /api/v1/chunker/health", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it("responds with health status", async () => {
    const response = await request(app).get("/api/v1/chunker/health");
    expect(response.statusCode).toBe(StatusCodes.OK);
    expect(response).toHaveProperty("body");

    const responseBody: ApiResponse<HeatlhStatus> =
      response.body as ApiResponse<HeatlhStatus>;
    expect(responseBody).toHaveProperty("data");

    const responseData: HeatlhStatus = responseBody.data as HeatlhStatus;
    expect(responseData).toHaveProperty("status");
    expect(responseData.status).toBe("UP");
    expect(responseData).toHaveProperty("version");
    expect(responseData.version).toBe("v1");
    expect(responseData).toHaveProperty("releaseId");
    expect(responseData.releaseId).toBe("0.1.0");
    expect(responseData).toHaveProperty("description");
    expect(responseData.description).toBe("Health of chunker service.");
  });

  it("can hanlde a custom thrown error", async () => {
    jest.spyOn(healthService, "status").mockImplementation(() => {
      const errors: FormattedRequestError = new FormattedRequestError({
        logging: true,
        code: StatusCodes.INTERNAL_SERVER_ERROR,
      });
      errors.addError("Health Check system not responding.");

      throw errors;
    });

    const response = await request(app).get("/api/v1/chunker/health");
    expect(response.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);

    const responseBody: ApiResponse<HeatlhStatus> =
      response.body as ApiResponse<HeatlhStatus>;
    expect(responseBody).toHaveProperty("errors");

    const responseErrors: CustomErrorContent[] =
      responseBody.errors as CustomErrorContent[];
    expect(responseErrors.length).toBe(1);

    const responseError: CustomErrorContent = responseErrors[0];
    expect(responseError).toHaveProperty("message");
    expect(responseError.message).toBe("Health Check system not responding.");
  });

  it("can hanlde a default custom thrown error", async () => {
    jest.spyOn(healthService, "status").mockImplementation(() => {
      const errors: FormattedRequestError = new FormattedRequestError();
      errors.addError("Internal Server Error.");
      throw errors;
    });

    const response = await request(app).get("/api/v1/chunker/health");
    expect(response.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);

    const responseBody: ApiResponse<HeatlhStatus> =
      response.body as ApiResponse<HeatlhStatus>;
    expect(responseBody).toHaveProperty("errors");

    const responseErrors: CustomError[] = responseBody.errors as CustomError[];
    expect(responseErrors.length).toBe(1);

    const responseError: CustomErrorContent = responseErrors[0];
    expect(responseError).toHaveProperty("message");
    expect(responseError.message).toBe("Internal Server Error.");
  });

  it("can hanlde a thrown error", async () => {
    jest.spyOn(healthService, "status").mockImplementation(() => {
      throw new Error("this is a pointless error");
    });

    const response = await request(app).get("/api/v1/chunker/health");
    expect(response.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);

    const responseBody: ApiResponse<HeatlhStatus> =
      response.body as ApiResponse<HeatlhStatus>;
    expect(responseBody).toHaveProperty("errors");

    const responseErrors: CustomError[] = responseBody.errors as CustomError[];
    expect(responseErrors.length).toBe(1);

    const responseError: CustomErrorContent = responseErrors[0];
    expect(responseError).toHaveProperty("message");
    expect(responseError.message).toBe("Something went wrong");
  });
});

describe("GET /api/v1/chunker/upload", () => {
  it("should add a file to the users root", async () => {
    const filePath = "test/files/README.md";
    const fileContent = fs.readFileSync(filePath);

    const response = await request(app)
      .post("/api/v1/chunker/upload")
      .field("user", "daveved")
      .field("filePath", ".")
      .attach("file", fileContent, "README.md");

    expect(response.status).toBe(200);
    expect(response).toHaveProperty("body");

    const responseBody: ApiResponse<FileUploadResult> =
      response.body as ApiResponse<FileUploadResult>;
    expect(responseBody).toHaveProperty("data");

    const responseData: FileUploadResult =
      responseBody.data as FileUploadResult;
    expect(responseData).toHaveProperty("eTag");
    expect(responseData.eTag).not.toBeNull();
    expect(responseData).toHaveProperty("versionId");
    expect(responseData.versionId).not.toBeNull();
    expect(responseData).toHaveProperty("location");
    expect(responseData.versionId).not.toBeNull();
  });

  it("should validate there is a file", async () => {
    const response = await request(app)
      .post("/api/v1/chunker/upload")
      .field("user", "daveved")
      .field("filePath", ".");

    expect(response.status).toBe(400);
    expect(response).toHaveProperty("body");

    const responseBody: ApiResponse<FileUploadResult> =
      response.body as ApiResponse<FileUploadResult>;
    expect(responseBody).toHaveProperty("errors");

    const responseErrors: CustomError[] = responseBody.errors as CustomError[];
    expect(responseErrors).toHaveLength(1);

    const responseError: CustomError = responseErrors[0];
    expect(responseError).toHaveProperty("message");
    expect(responseError.message).toBe(
      "Invalid Request Input - {file} is required.",
    );
  });

  it("should validate there is a username and filepath", async () => {
    const filePath = "test/files/README.md";
    const fileContent = fs.readFileSync(filePath);
    const response = await request(app)
      .post("/api/v1/chunker/upload")
      .attach("file", fileContent, "README.md");

    expect(response.status).toBe(400);
    expect(response).toHaveProperty("body");

    const responseBody: ApiResponse<FileUploadResult> =
      response.body as ApiResponse<FileUploadResult>;
    expect(responseBody).toHaveProperty("errors");

    const responseErrors: CustomError[] = responseBody.errors as CustomError[];
    expect(responseErrors).toHaveLength(2);
    expect(responseErrors).toEqual(
      expect.arrayContaining([
        {
          message:
            "Invalid Request Input - {filePath} is required and must be a string.",
        },
        {
          message:
            "Invalid Request Input - {user} is required and must be a string.",
        },
      ]),
    );
  });

  it("should validate there is a username ", async () => {
    const filePath = "test/files/README.md";
    const fileContent = fs.readFileSync(filePath);
    const response = await request(app)
      .post("/api/v1/chunker/upload")
      .field("filePath", ".")
      .attach("file", fileContent, "README.md");

    expect(response.status).toBe(400);
    expect(response).toHaveProperty("body");

    const responseBody: ApiResponse<FileUploadResult> =
      response.body as ApiResponse<FileUploadResult>;
    expect(responseBody).toHaveProperty("errors");

    const responseErrors: CustomError[] = responseBody.errors as CustomError[];
    expect(responseErrors).toHaveLength(1);
    expect(responseErrors).toEqual(
      expect.arrayContaining([
        {
          message:
            "Invalid Request Input - {user} is required and must be a string.",
        },
      ]),
    );
  });

  it("should validate there is a filePath ", async () => {
    const filePath = "test/files/README.md";
    const fileContent = fs.readFileSync(filePath);
    const response = await request(app)
      .post("/api/v1/chunker/upload")
      .field("user", "daveved")
      .attach("file", fileContent, "README.md");

    expect(response.status).toBe(400);
    expect(response).toHaveProperty("body");

    const responseBody: ApiResponse<FileUploadResult> =
      response.body as ApiResponse<FileUploadResult>;
    expect(responseBody).toHaveProperty("errors");

    const responseErrors: CustomError[] = responseBody.errors as CustomError[];
    expect(responseErrors).toHaveLength(1);
    expect(responseErrors).toEqual(
      expect.arrayContaining([
        {
          message:
            "Invalid Request Input - {filePath} is required and must be a string.",
        },
      ]),
    );
  });

  it("should validate all inputs", async () => {
    const response = await request(app).post("/api/v1/chunker/upload");

    expect(response.status).toBe(400);
    expect(response).toHaveProperty("body");

    const responseBody: ApiResponse<FileUploadResult> =
      response.body as ApiResponse<FileUploadResult>;
    expect(responseBody).toHaveProperty("errors");

    const responseErrors: CustomError[] = responseBody.errors as CustomError[];
    expect(responseErrors).toHaveLength(3);
    expect(responseErrors).toEqual(
      expect.arrayContaining([
        {
          message:
            "Invalid Request Input - {filePath} is required and must be a string.",
        },
        {
          message:
            "Invalid Request Input - {user} is required and must be a string.",
        },
        { message: "Invalid Request Input - {file} is required." },
      ]),
    );
  });

  it("should hanlde file path that starts with '/'", async () => {
    const filePath = "test/files/README.md";
    const fileContent = fs.readFileSync(filePath);

    const response = await request(app)
      .post("/api/v1/chunker/upload")
      .field("user", "daveved")
      .field("filePath", "/abcd")
      .attach("file", fileContent, "README.md");

    expect(response.status).toBe(200);
    expect(response).toHaveProperty("body");

    const responseBody: ApiResponse<FileUploadResult> =
      response.body as ApiResponse<FileUploadResult>;
    expect(responseBody).toHaveProperty("data");

    const responseData: FileUploadResult =
      responseBody.data as FileUploadResult;
    expect(responseData).toHaveProperty("eTag");
    expect(responseData.eTag).not.toBeNull();
    expect(responseData).toHaveProperty("versionId");
    expect(responseData.versionId).not.toBeNull();
    expect(responseData).toHaveProperty("location");
    expect(responseData.versionId).not.toBeNull();
  });

  it("should hanlde file path that ends with '/'", async () => {
    const filePath = "test/files/README.md";
    const fileContent = fs.readFileSync(filePath);

    const response = await request(app)
      .post("/api/v1/chunker/upload")
      .field("user", "daveved")
      .field("filePath", "abcd/")
      .attach("file", fileContent, "README.md");

    expect(response.status).toBe(200);
    expect(response).toHaveProperty("body");

    const responseBody: ApiResponse<FileUploadResult> =
      response.body as ApiResponse<FileUploadResult>;
    expect(responseBody).toHaveProperty("data");

    const responseData: FileUploadResult =
      responseBody.data as FileUploadResult;
    expect(responseData).toHaveProperty("eTag");
    expect(responseData.eTag).not.toBeNull();
    expect(responseData).toHaveProperty("versionId");
    expect(responseData.versionId).not.toBeNull();
    expect(responseData).toHaveProperty("location");
    expect(responseData.versionId).not.toBeNull();
  });

  it("should hanlde file path that starts and ends with '/'", async () => {
    const filePath = "test/files/README.md";
    const fileContent = fs.readFileSync(filePath);

    const response = await request(app)
      .post("/api/v1/chunker/upload")
      .field("user", "daveved")
      .field("filePath", "/!ab!cd!/")
      .attach("file", fileContent, "README.md");

    expect(response.status).toBe(400);
    expect(response).toHaveProperty("body");

    const responseBody: ApiResponse<FileUploadResult> =
      response.body as ApiResponse<FileUploadResult>;
    expect(responseBody).toHaveProperty("errors");

    const responseErrors: CustomError[] = responseBody.errors as CustomError[];
    expect(responseErrors).toHaveLength(1);
    expect(responseErrors).toEqual(
      expect.arrayContaining([
        {
          message:
            "Invalid {filePath} after formatting daveved/!ab!cd!/README.md",
        },
      ]),
    );
  });
});
