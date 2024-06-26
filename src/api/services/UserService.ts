import { Service } from "typedi";

import { Logger } from "../../lib/logger";
import { CharacterCasing } from "../enums/CharacterCasing";
import { ResponseStatus } from "../enums/ResponseStatus";
import { UserRepository } from "../repositories/UserRepository";
import CreateUserRequest from "../requests/payloads/CreateUserRequest";
import { ServiceResponse } from "../responses";

import BaseService from "./BaseService";
import UtilityService from "./UtilityService";


@Service()
export default class UserService extends BaseService {
    constructor(
        private log: Logger,
    ) {
        super();
    }
    
    
    public async createUser(userData: CreateUserRequest): Promise<ServiceResponse> {
        try {
            const { email, password: userPassword, firstName, lastName, phoneNumber } = userData;

            const existingUser = await UserRepository.findExisting(email, phoneNumber);
            if(existingUser){
                return ServiceResponse.error("User with email or phone number already exists", ResponseStatus.BAD_REQUEST);
            }

            const accountNumber = UtilityService.generateRandomString(10, CharacterCasing.LOWER, true);
            const password = await UtilityService.hashPassword(userPassword);

            const user = await UserRepository.create({ email, password, firstName, lastName, phoneNumber, accountNumber });
            
            delete user.password;

            return ServiceResponse.success("User registration successful", user, null, ResponseStatus.CREATED);
        } catch (err) {
            this.log.error("Could not register user", { err });
            return ServiceResponse.error(`Could not register user: ${err}`);
        }
    }
}