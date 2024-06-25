import { Body, HttpCode, JsonController, Post } from "routing-controllers";
import { OpenAPI } from "routing-controllers-openapi";

import UserService from "../../api/services/UserService";
import { ResponseStatus } from "../enums/ResponseStatus";
import IResponse from "../interfaces/IResponse";
import CreateUserRequest from "../requests/payloads/CreateUserRequest";
import { ErrorResponse, SuccessResponse } from "../responses";

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
        if (!response.status) {
            return Promise.reject(new ErrorResponse(response.message, response.code, response.data));
        }

        return Promise.resolve(new SuccessResponse(response.message, response.data));
    }
}