import { Authorized, Body, HttpCode, JsonController, Post } from "routing-controllers";
import { OpenAPI } from "routing-controllers-openapi";

import UserService from "../../api/services/UserService";
import { GetHeaders } from "../../decorators/GetHeaders";
import ResponseHandler from "../../handlers/ResponseHandler";
import { ResponseStatus } from "../enums/ResponseStatus";
import IResponse from "../interfaces/IResponse";
import CreateUserRequest from "../requests/payloads/CreateUserRequest";
import UserLoginRequest from "../requests/payloads/UserLoginRequest";
import WalletRequest from "../requests/payloads/WalletRequest";
import WalletTransferRequest from "../requests/payloads/WalletTransferRequest";


@JsonController("/user")
export default class UserController {
    constructor(
        private userService: UserService,
    ) { }


    @OpenAPI({ summary: "User Registration" })
    @HttpCode(ResponseStatus.CREATED)
    @Post()
    public async create(
        @Body({ required: true, validate: true, type: CreateUserRequest }) payload: CreateUserRequest
    ): Promise<IResponse> {
        const response = await this.userService.createUser(payload);
        return ResponseHandler.returnResponse(response);
    }

    @OpenAPI({ summary: "User Login" })
    @Post("/login")
    public async login(
        @Body({
            required: true,
            validate: true,
            type: UserLoginRequest
        }) payload: UserLoginRequest
    ): Promise<IResponse> {
        const { email, password } = payload;

        const response = await this.userService.login(email, password);
        return ResponseHandler.returnResponse(response);
    }

    @OpenAPI({ summary: "Fund Wallet", security: [{ bearerAuth: [] }] })
    @Authorized()
    @Post("/wallet/fund")
    public async fundWallet(
        @Body({ required: true, validate: true, type: WalletRequest }) payload: WalletRequest,
        @GetHeaders() headers: any
    ): Promise<IResponse> {
        this.userService.setCurrentRequestHeaders(headers);

        const { amount } = payload;

        const response = await this.userService.fundWallet( amount);
        return ResponseHandler.returnResponse(response);
    }

    @OpenAPI({ summary: "Withdraw From Wallet", security: [{ bearerAuth: [] }] })
    @Authorized()
    @Post("/wallet/withdraw")
    public async withdrawFromWallet(
        @Body({ required: true, validate: true, type: WalletRequest }) payload: WalletRequest,
        @GetHeaders() headers: any
    ): Promise<IResponse> {
        this.userService.setCurrentRequestHeaders(headers);

        const { amount } = payload;

        const response = await this.userService.withdrawFromWallet( amount);
        return ResponseHandler.returnResponse(response);
    }

    @OpenAPI({ summary: "Transfer To Wallet", security: [{ bearerAuth: [] }] })
    @Authorized()
    @Post("/wallet/transfer")
    public async transferToWallet(
        @Body({ required: true, validate: true, type: WalletTransferRequest }) payload: WalletTransferRequest,
        @GetHeaders() headers: any
    ): Promise<IResponse> {
        this.userService.setCurrentRequestHeaders(headers);

        const { receiverAccountNumber, amount } = payload;

        const response = await this.userService.transferToWallet(receiverAccountNumber, amount);
        return ResponseHandler.returnResponse(response);
    }
}