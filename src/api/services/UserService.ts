import { Service } from "typedi";

import { Logger } from "../../lib/logger";
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

            const password = await UtilityService.hashPassword(userPassword);

            const user = await UserRepository.create({ email, password, firstName, lastName, phoneNumber });
            
            delete user.password;

            return ServiceResponse.success("User registration successful", user, null, ResponseStatus.CREATED);
        } catch (err) {
            this.log.error("Could not register user", { err });
            return ServiceResponse.error(`Could not register user: ${err}`);
            // throw new Error(`Error creating user: ${error.message}`);
        }
    }

    // async getUserByEmail(email) {
    //     try {
    //         const user = await UserRepository.findByEmail(email);
    //         return user;
    //     } catch (err) {
    //         throw new Error(`Error fetching user by email: ${error.message}`);
    //     }
    // }

    // async getUserById(userId) {
    //     try {
    //         const user = await UserRepository.findById(userId);
    //         return user;
    //     } catch (err) {
    //         throw new Error(`Error fetching user by ID: ${error.message}`);
    //     }
    // }

    // async updateUser(userId, updateData) {
    //     try {
    //         const user = await UserRepository.findById(userId);
    //         if (!user) {
    //             throw new Error("User not found");
    //         }
    //         const updatedUser = await UserRepository.updateUser(user, updateData);
    //         return updatedUser;
    //     } catch (err) {
    //         throw new Error(`Error updating user: ${error.message}`);
    //     }
    // }
}