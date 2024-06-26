import IResponse from "../api/interfaces/IResponse";
import { ErrorResponse, ServiceResponse, SuccessResponse } from "../api/responses";

export default class ResponseHandler {
    public static async returnResponse(response: ServiceResponse): Promise<IResponse> {
        if (!response.status) {
            return Promise.reject(new ErrorResponse(response.message, response.code, response.data));
        }

        const successResponse = new SuccessResponse(response.message, response.data);
        if (response.meta !== undefined && response.meta !== null) {
            successResponse.meta = response.meta;
        }

        return Promise.resolve(successResponse);
    }
}