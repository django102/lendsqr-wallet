import { Service } from "typedi";

import { Logger } from "../../lib/logger";
import { CharacterCasing } from "../enums/CharacterCasing";
import { ResponseStatus } from "../enums/ResponseStatus";
import { UserRepository } from "../repositories/UserRepository";
import CreateUserRequest from "../requests/payloads/CreateUserRequest";
import { ServiceResponse } from "../responses";

import AuthenticationService from "./AuthenticationService";
import BaseService from "./BaseService";
import UtilityService from "./UtilityService";


@Service()
export default class UserService extends BaseService {
    constructor(
        private log: Logger,
        private authenticationService: AuthenticationService,
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

    public async login(email:string, password:string) : Promise<ServiceResponse> {
        try {
            const user = await UserRepository.findByEmail(email);
            if(!user) {
                return ServiceResponse.error("Invalid email address or password", ResponseStatus.UNAUTHORIZED);
            }

            const userPassword = user.password;
            const isSame = await UtilityService.comparePassword(password, userPassword);
            if(!isSame) {
                return ServiceResponse.error("Invalid email addresses or password", ResponseStatus.UNAUTHORIZED);
            }

            delete user.password;

            const token = this.authenticationService.issueToken(user);

            return ServiceResponse.success("User login successful", { user, token });
        } catch (err) {
            this.log.error("Could not login at this time", { err });
            return ServiceResponse.error(`Could not login at this time: ${err}`);
        }
    }
}