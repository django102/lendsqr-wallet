import { ValidationError } from "class-validator";
import * as express from "express";
import { Action, HttpError } from "routing-controllers";
import request from "supertest";

import { ResponseStatus } from "../../../../src/api/enums/ResponseStatus";
import CreateUserRequest from "../../../../src/api/requests/payloads/CreateUserRequest";
import { ServiceResponse } from "../../../../src/api/responses";
import AuthenticationService from "../../../../src/api/services/AuthenticationService";
import UserService from "../../../../src/api/services/UserService";
import { ResponseInterceptor } from "../../../../src/interceptors/ResponseInterceptor";
import { ErrorHandlerMiddleware } from "../../../../src/middlewares/ErrorHandlerMiddleware";
import { LogMiddleware } from "../../../../src/middlewares/LogMiddleware";
import { bootstrapApp, BootstrapSettings } from "../../../../src/utils/test/e2e/bootstrap";


describe("/user", () => {
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
    });


    describe("POST /", () => {
        let CreateUserMock: jest.SpyInstance;   

        beforeAll(() => {
            CreateUserMock = jest.spyOn(UserService.prototype, "createUser");
        });

        it("should create a user successfully", async () => {    
            const mockPayload: CreateUserRequest = { 
                "email": "user@example.com",
                "password": "a3$Assaw3",
                "firstName": "string",
                "lastName": "string",
                "phoneNumber": "string" 
            };
            const mockResponse: ServiceResponse = {
                code: ResponseStatus.CREATED,
                status: true,
                message: "User Registration Successful",
                data: { ...mockPayload, createdAt: new Date(), id: 1 }
            };

            CreateUserMock.mockResolvedValue(Promise.resolve(mockResponse));

            const response = await request(settings.app)
                .post("/user")
                .send(mockPayload);

            expect(response.status).toBe(mockResponse.code);
            expect(response.body.status).toEqual(mockResponse.status);
            expect(response.body.message).toEqual(mockResponse.message);
        });

        it("should fail to create a user when email is missing", async () => {    
            const mockPayload: Partial<CreateUserRequest> = { 
                "password": "a3$Assaw3",
                "firstName": "string",
                "lastName": "string",
                "phoneNumber": "string" 
            };
           
            const response = await request(settings.app)
                .post("/user")
                .send(mockPayload);

            expect(response.status).toBe(ResponseStatus.BAD_REQUEST);
            expect(response.body.status).toEqual(false);
        });

        it("should fail to create a user when email is not in the correct format", async () => {    
            const mockPayload: Partial<CreateUserRequest> = { 
                "email": "example.com",
                "password": "a3$Assaw3",
                "firstName": "string",
                "lastName": "string",
                "phoneNumber": "string" 
            };

            const response = await request(settings.app)
                .post("/user")
                .send(mockPayload);

            expect(response.status).toBe(ResponseStatus.BAD_REQUEST);
            expect(response.body.status).toEqual(false);
        });

        it("should fail to create a user when password is missing", async () => {    
            const mockPayload: Partial<CreateUserRequest> = { 
                "email": "example.com",
                "firstName": "string",
                "lastName": "string",
                "phoneNumber": "string" 
            };

            const response = await request(settings.app)
                .post("/user")
                .send(mockPayload);

            expect(response.status).toBe(ResponseStatus.BAD_REQUEST);
            expect(response.body.status).toEqual(false);
        });

        it("should fail to create a user when password is not in the correct format", async () => {    
            const mockPayload: Partial<CreateUserRequest> = { 
                "email": "example.com",
                "password": "aab",
                "firstName": "string",
                "lastName": "string",
                "phoneNumber": "string" 
            };
            
            const response = await request(settings.app)
                .post("/user")
                .send(mockPayload);

            expect(response.status).toBe(ResponseStatus.BAD_REQUEST);
            expect(response.body.status).toEqual(false);
        });

        it("should fail to create a user when first name is missing", async () => {    
            const mockPayload: Partial<CreateUserRequest> = { 
                "email": "example.com",
                "password": "a3$Assaw3",
                "lastName": "string",
                "phoneNumber": "string" 
            };
            const response = await request(settings.app)
                .post("/user")
                .send(mockPayload);

            expect(response.status).toBe(ResponseStatus.BAD_REQUEST);
            expect(response.body.status).toEqual(false);
        });

        it("should fail to create a user when last name is missing", async () => {    
            const mockPayload: Partial<CreateUserRequest> = { 
                "email": "example.com",
                "password": "a3$Assaw3",
                "firstName": "string",
                "phoneNumber": "string" 
            };
            
            const response = await request(settings.app)
                .post("/user")
                .send(mockPayload);

            expect(response.status).toBe(ResponseStatus.BAD_REQUEST);
            expect(response.body.status).toEqual(false);
        });

        it("should fail to create a user when phone number is missing", async () => {    
            const mockPayload: Partial<CreateUserRequest> = { 
                "email": "example.com",
                "password": "a3$Assaw3",
                "firstName": "string",
                "lastName": "string" 
            };
            
            const response = await request(settings.app)
                .post("/user")
                .send(mockPayload);

            expect(response.status).toBe(ResponseStatus.BAD_REQUEST);
            expect(response.body.status).toEqual(false);
        });

        it("should fail to create a user when payload is missing", async () => {    
            const response = await request(settings.app)
                .post("/user")
                .send();

            expect(response.status).toBe(ResponseStatus.BAD_REQUEST);
            expect(response.body.status).toEqual(false);
        });

        it("should handle error when creating a user fails", async () => {
            const mockPayload: CreateUserRequest = { 
                "email": "user@example.com",
                "password": "a3$Assaw3",
                "firstName": "string",
                "lastName": "string",
                "phoneNumber": "string" 
            };
            const mockResponse: ServiceResponse = {
                code: ResponseStatus.INTERNAL_SERVER_ERROR,
                status: false,
            };

            CreateUserMock.mockResolvedValue(Promise.resolve(mockResponse));

            const response = await request(settings.app)
                .post("/user")
                .send(mockPayload);

            expect(response.status).toBe(mockResponse.code);
            expect(response.body.status).toEqual(mockResponse.status);
        });
    });

    describe("POST /login", () => {
        let userLoginMock: jest.SpyInstance;

        beforeEach(() => {
            userLoginMock = jest.spyOn(UserService.prototype, "login");
        });

        it("should login a user successfully", async () => {   
            const mockPayload = {
                "email": "user@example.com",
                "password": "a3$Assaw3",
            };
            const mockUser = { 
                "email": "user@example.com",
                "firstName": "string",
                "lastName": "string",
                "phoneNumber": "string" 
            };
            const mockToken = "someToken";
            const mockResponse: ServiceResponse = {
                code: ResponseStatus.OK,
                status: true,
                message: "User login Successful",
                data: { user: { ...mockUser, createdAt: new Date(), id: 1 }, token: mockToken }
            };

            userLoginMock.mockResolvedValue(Promise.resolve(mockResponse));

            const response = await request(settings.app)
                .post("/user/login")
                .send(mockPayload);

            expect(response.status).toBe(mockResponse.code);
            expect(response.body.status).toEqual(mockResponse.status);
            expect(response.body.message).toEqual(mockResponse.message);
        });

        it("should fail to login a user when email is missing", async () => {    
            const mockPayload = {
                "password": "a3$Assaw3",
            };
            
            const response = await request(settings.app)
                .post("/user/login")
                .send(mockPayload);

            expect(response.status).toBe(ResponseStatus.BAD_REQUEST);
            expect(response.body.status).toEqual(false);
        });

        it("should fail to login a user when email is not in the correct format", async () => {    
            const mockPayload = {
                "email": "example.com",
                "password": "a3$Assaw3",
            };
            
            const response = await request(settings.app)
                .post("/user/login")
                .send(mockPayload);

            expect(response.status).toBe(ResponseStatus.BAD_REQUEST);
            expect(response.body.status).toEqual(false);
        });

        it("should fail to login a user when password is missing", async () => {    
            const mockPayload = {
                "email": "user@example.com",
            };
           
            const response = await request(settings.app)
                .post("/user/login")
                .send(mockPayload);

            expect(response.status).toBe(ResponseStatus.BAD_REQUEST);
            expect(response.body.status).toEqual(false);
        });

        it("should fail if the login process fails", async () => {   
            const mockPayload = {
                "email": "user@example.com",
                "password": "a3$Assaw3",
            };
            const mockResponse: ServiceResponse = {
                code: ResponseStatus.INTERNAL_SERVER_ERROR,
                status: false,
                message: "Something happened",
            };

            userLoginMock.mockResolvedValue(Promise.resolve(mockResponse));

            const response = await request(settings.app)
                .post("/user/login")
                .send(mockPayload);

            expect(response.status).toBe(mockResponse.code);
            expect(response.body.status).toEqual(mockResponse.status);
            expect(response.body.message).toEqual(mockResponse.message);
        });
    });

    describe("POST /fund", () => {
        let fundWalletMock: jest.SpyInstance;   

        beforeAll(() => {
            jest.spyOn(AuthenticationService.prototype, "validateAuthorization").mockResolvedValue({
                status: true, message: "Validation successful", data: { id: 1, firstName: "me", lastName: "you", email: "hello@me.com", accountNumber: "0000012345" }
            });
        });

        beforeEach(() => {
            fundWalletMock = jest.spyOn(UserService.prototype, "fundWallet");
        });


        it("should fund a wallet successfully", async () => {
            const mockWalletRequest = { amount: 20000 };
            const mockResponse: ServiceResponse = {
                code: ResponseStatus.OK,
                status: true,
                message: "OK",
                data: { id: 1, accountNumber: "0000012345" },
            };

            fundWalletMock.mockResolvedValue(Promise.resolve(mockResponse));

            const response = await request(settings.app)
                .post("/user/wallet/fund")
                .send(mockWalletRequest);

            expect(response.status).toBe(mockResponse.code);
            expect(response.body.status).toEqual(mockResponse.status);
            expect(response.body.message).toEqual(mockResponse.message);
        });

        it("should fail if amount is missing", async () => {
            const mockWalletRequest = { };
            const response = await request(settings.app)
                .post("/user/wallet/fund")
                .send(mockWalletRequest);

            expect(response.status).toBe(ResponseStatus.BAD_REQUEST);
            expect(response.body.status).toEqual(false);
        });

        it("should handle error when funding a wallet", async () => {
            const mockWalletRequest = { amount: 20000 };
            const mockResponse: ServiceResponse = {
                code: ResponseStatus.INTERNAL_SERVER_ERROR,
                status: false,
            };

            fundWalletMock.mockResolvedValue(Promise.resolve(mockResponse));

            const response = await request(settings.app)
                .post("/user/wallet/fund")
                .send(mockWalletRequest);

            expect(response.status).toBe(mockResponse.code);
            expect(response.body.status).toEqual(mockResponse.status);
        });

        it("should fail if authorization fails", async () => {
            jest.spyOn(AuthenticationService.prototype, "validateAuthorization").mockResolvedValue({
                status: false, message: "Some error"
            });
            const mockWalletRequest = { amount: 20000 };

            const response = await request(settings.app)
                .post("/user/wallet/fund")
                .send(mockWalletRequest);

            expect(response.status).toBe(ResponseStatus.UNAUTHORIZED);
            expect(response.body.status).toEqual(false);
        });
    });

    describe("POST /withdraw", () => {
        let withdrawWalletMock: jest.SpyInstance;   

        beforeAll(() => {
            jest.spyOn(AuthenticationService.prototype, "validateAuthorization").mockResolvedValue({
                status: true, message: "Validation successful", data: { id: 1, firstName: "me", lastName: "you", email: "hello@me.com", accountNumber: "0000012345" }
            });
        });

        beforeEach(() => {
            withdrawWalletMock = jest.spyOn(UserService.prototype, "withdrawFromWallet");
        });


        it("should withdraw from a wallet successfully", async () => {
            const mockWalletRequest = { amount: 20000 };
            const mockResponse: ServiceResponse = {
                code: ResponseStatus.OK,
                status: true,
                message: "OK",
                data: { id: 1, accountNumber: "0000012345" },
            };

            withdrawWalletMock.mockResolvedValue(Promise.resolve(mockResponse));

            const response = await request(settings.app)
                .post("/user/wallet/withdraw")
                .send(mockWalletRequest);

            expect(response.status).toBe(mockResponse.code);
            expect(response.body.status).toEqual(mockResponse.status);
            expect(response.body.message).toEqual(mockResponse.message);
        });

        it("should fail if amount is missing", async () => {
            const mockWalletRequest = { };
            const response = await request(settings.app)
                .post("/user/wallet/withdraw")
                .send(mockWalletRequest);

            expect(response.status).toBe(ResponseStatus.BAD_REQUEST);
            expect(response.body.status).toEqual(false);
        });

        it("should handle error when withdrawing from a wallet", async () => {
            const mockWalletRequest = { amount: 20000 };
            const mockResponse: ServiceResponse = {
                code: ResponseStatus.INTERNAL_SERVER_ERROR,
                status: false,
            };

            withdrawWalletMock.mockResolvedValue(Promise.resolve(mockResponse));

            const response = await request(settings.app)
                .post("/user/wallet/withdraw")
                .send(mockWalletRequest);

            expect(response.status).toBe(mockResponse.code);
            expect(response.body.status).toEqual(mockResponse.status);
        });

        it("should fail if authorization fails", async () => {
            jest.spyOn(AuthenticationService.prototype, "validateAuthorization").mockResolvedValue({
                status: false, message: "Some error"
            });
            const mockWalletRequest = { amount: 20000 };

            const response = await request(settings.app)
                .post("/user/wallet/withdraw")
                .send(mockWalletRequest);

            expect(response.status).toBe(ResponseStatus.UNAUTHORIZED);
            expect(response.body.status).toEqual(false);
        });
    });

    describe("POST /transfer", () => {
        let transferWalletMock: jest.SpyInstance;   

        beforeAll(() => {
            jest.spyOn(AuthenticationService.prototype, "validateAuthorization").mockResolvedValue({
                status: true, message: "Validation successful", data: { id: 1, firstName: "me", lastName: "you", email: "hello@me.com", accountNumber: "0000012345" }
            });
        });

        beforeEach(() => {
            transferWalletMock = jest.spyOn(UserService.prototype, "transferToWallet");
        });


        it("should transfer between wallets successfully", async () => {
            const mockWalletRequest = { receiverAccountNumber: "0000012346", amount: 20000 };
            const mockResponse: ServiceResponse = {
                code: ResponseStatus.OK,
                status: true,
                message: "OK",
                data: { id: 1, accountNumber: "0000012345" },
            };

            transferWalletMock.mockResolvedValue(Promise.resolve(mockResponse));

            const response = await request(settings.app)
                .post("/user/wallet/transfer")
                .send(mockWalletRequest);

            expect(response.status).toBe(mockResponse.code);
            expect(response.body.status).toEqual(mockResponse.status);
            expect(response.body.message).toEqual(mockResponse.message);
        });

        it("should fail if destination account number is missing", async () => {
            const mockWalletRequest = { amount: 20000 };
            const response = await request(settings.app)
                .post("/user/wallet/transfer")
                .send(mockWalletRequest);

            expect(response.status).toBe(ResponseStatus.BAD_REQUEST);
            expect(response.body.status).toEqual(false);
        });

        it("should fail if amount is missing", async () => {
            const mockWalletRequest = { receiverAccountNumber: "0000012346" };
            const response = await request(settings.app)
                .post("/user/wallet/transfer")
                .send(mockWalletRequest);

            expect(response.status).toBe(ResponseStatus.BAD_REQUEST);
            expect(response.body.status).toEqual(false);
        });

        it("should handle error when transfering from a wallet", async () => {
            const mockWalletRequest = { receiverAccountNumber: "0000012346", amount: 20000 };
            const mockResponse: ServiceResponse = {
                code: ResponseStatus.INTERNAL_SERVER_ERROR,
                status: false,
            };

            transferWalletMock.mockResolvedValue(Promise.resolve(mockResponse));

            const response = await request(settings.app)
                .post("/user/wallet/transfer")
                .send(mockWalletRequest);

            expect(response.status).toBe(mockResponse.code);
            expect(response.body.status).toEqual(mockResponse.status);
        });

        it("should fail if authorization fails", async () => {
            jest.spyOn(AuthenticationService.prototype, "validateAuthorization").mockResolvedValue({
                status: false, message: "Some error"
            });
            const mockWalletRequest = { receiverAccountNumber: "0000012346", amount: 20000 };

            const response = await request(settings.app)
                .post("/user/wallet/transfer")
                .send(mockWalletRequest);

            expect(response.status).toBe(ResponseStatus.UNAUTHORIZED);
            expect(response.body.status).toEqual(false);
        });
    });
});