import { ValidationError } from "class-validator";
import * as express from "express";
import { Action, HttpError } from "routing-controllers";
import request from "supertest";

import { ResponseStatus } from "../../../../src/api/enums/ResponseStatus";
import { ResponseInterceptor } from "../../../../src/interceptors/ResponseInterceptor";
import { ErrorHandlerMiddleware } from "../../../../src/middlewares/ErrorHandlerMiddleware";
import { LogMiddleware } from "../../../../src/middlewares/LogMiddleware";
import { bootstrapApp, BootstrapSettings } from "../../../../src/utils/test/e2e/bootstrap";

describe("/", () => {
    let settings: BootstrapSettings;

    beforeAll(async () => {
        settings = await bootstrapApp();

        jest.spyOn(LogMiddleware.prototype, "use").mockImplementation((req: express.Request, res: express.Response, next: express.NextFunction) => {    
            next();
        });
        jest.spyOn(ResponseInterceptor.prototype, "intercept").mockImplementation((action: Action, content: any) => {
            return content;
        });
        jest.spyOn(ErrorHandlerMiddleware.prototype, "error").mockImplementation((error: HttpError, request: express.Request, response: any)=>{
            response.status(error.httpCode ? error.httpCode : ResponseStatus.INTERNAL_SERVER_ERROR);
            const responseJson: any = {
                status: false,
                message: error.message,
            };
            if (error["errors"]) {
                if (error["errors"].length && error["errors"][0] instanceof ValidationError) {
                    responseJson.message = "some validation response errors";
                    response.message = responseJson.errors;
                } else {
                    responseJson.message = error["errors"];
                }
            }
            response.json(responseJson);
        });
    });

    afterAll(async () => {
        if (settings.connection) {
            await settings.connection.dropDatabase();
            await settings.connection.close();
        }

        jest.clearAllMocks();
        // await new Promise<void>(resolve => setTimeout(() => resolve(), 10000)); // avoid jest open handle error
    });


    describe("GET", () => {
        it("should call the home endpoint successfully", async () => {
            const response = await request(settings.app)
                .get("/")
                .send();

            expect(response.status).toBe(ResponseStatus.OK);
            expect(response.body.status).toEqual(true);
            expect(response.body.message).toEqual("Lendsqr Backend Engineer Assessment");
        });
    });
});