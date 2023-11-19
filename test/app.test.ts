import app from "../src/app";
import request from "supertest";
import { StatusCodes } from 'http-status-codes'
import * as healthService from "../src/services/healthService";
import { CustomErrorContent } from "../src/types/Response";
import FormatedRequestError, { CustomError } from "../src/util/errors";

describe("GET /api/v1/chunker/health", () => {
    const OLD_ENV = process.env;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
        process.env = {...OLD_ENV};
    });

    afterAll(() => {
        process.env = OLD_ENV;
    });

    it("responds with health status", async () => {
        const response = await request(app).get("/api/v1/chunker/health");
        expect(response.statusCode).toBe(StatusCodes.OK);
        expect(response).toHaveProperty("body");

        const responseBody = response.body;
        expect(responseBody).toHaveProperty("data");
        
        const responseData = responseBody.data;
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
        jest.spyOn(healthService, 'status').mockImplementation(() => {
            throw new FormatedRequestError({ code: StatusCodes.INTERNAL_SERVER_ERROR, message: "Health Check system not responding.", logging: true });
        });

        const response = await request(app).get("/api/v1/chunker/health");
        expect(response.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);

        const responseBody = response.body;
        expect(responseBody).toHaveProperty("errors");

        const responseErrors: CustomError[] = responseBody.errors;
        expect(responseErrors.length).toBe(1);

        const responseError: CustomErrorContent = responseErrors[0];
        expect(responseError).toHaveProperty("message");
        expect(responseError.message).toBe("Health Check system not responding.");
    });

    it("can hanlde a default custom thrown error", async () => {
        jest.spyOn(healthService, 'status').mockImplementation(() => {
            throw new FormatedRequestError();
        });

        const response = await request(app).get("/api/v1/chunker/health");
        expect(response.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);

        const responseBody = response.body;
        expect(responseBody).toHaveProperty("errors");

        const responseErrors: CustomError[] = responseBody.errors;
        expect(responseErrors.length).toBe(1);

        const responseError: CustomErrorContent = responseErrors[0];
        expect(responseError).toHaveProperty("message");
        expect(responseError.message).toBe("Internal Server Error.");
    });

    it("can hanlde a thrown error", async () => {
        jest.spyOn(healthService, 'status').mockImplementation(() => {
            throw new Error("this is a pointless error");
        });

        const response = await request(app).get("/api/v1/chunker/health");
        expect(response.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);

        const responseBody = response.body;
        expect(responseBody).toHaveProperty("errors");

        const responseErrors: CustomError[] = responseBody.errors;
        expect(responseErrors.length).toBe(1);

        const responseError: CustomErrorContent = responseErrors[0];
        expect(responseError).toHaveProperty("message");
        expect(responseError.message).toBe("Something went wrong");
    });
})