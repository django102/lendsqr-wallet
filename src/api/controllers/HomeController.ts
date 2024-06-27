import { Get, JsonController } from "routing-controllers";

import IResponse from "../interfaces/IResponse";
import { SuccessResponse } from "../responses";

@JsonController("/")
export default class HomeController {
    constructor() {}

    @Get()
    public async loadDefaultPage(
    ): Promise<IResponse> {
        return Promise.resolve(new SuccessResponse("Lendsqr Backend Engineer Assessment"));
    }
}