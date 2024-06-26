import { Body, HttpCode, JsonController, Post } from "routing-controllers";
import { OpenAPI } from "routing-controllers-openapi";

import UserService from "../../api/services/UserService";
import ResponseHandler from "../../handlers/ResponseHandler";
import { ResponseStatus } from "../enums/ResponseStatus";
import IResponse from "../interfaces/IResponse";
import CreateUserRequest from "../requests/payloads/CreateUserRequest";
import UserLoginRequest from "../requests/payloads/UserLoginRequest";

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
}