import { Action, UnauthorizedError } from "routing-controllers";
import Container from "typedi";

import AuthenticationService from "../services/AuthenticationService";


export function AuthorizationChecker(): (action: Action) => Promise<boolean> | boolean {
    const authenticationService = Container.get<AuthenticationService>(AuthenticationService);

    return async function innerAuthorizationChecker(action: Action): Promise<boolean> {
        const headers = action.request.headers;
        const validationResult = await authenticationService.validateAuthorization(headers);

        if(!validationResult.status){
            throw new UnauthorizedError(validationResult.message);
        }

        action.request.headers["user"] = validationResult.data;
        return true;
    };
}