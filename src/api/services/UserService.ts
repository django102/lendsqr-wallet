import { Service } from "typedi";

import { Logger } from "../../lib/logger";
import { CharacterCasing } from "../enums/CharacterCasing";
import { ResponseStatus } from "../enums/ResponseStatus";
import AuthenticatedParty from "../models/AuthenticatedParty";
import { UserRepository } from "../repositories/UserRepository";
import CreateUserRequest from "../requests/payloads/CreateUserRequest";
import { ServiceResponse } from "../responses";

import AdjutorService from "./AdjutorService";
import AuthenticationService from "./AuthenticationService";
import BaseService from "./BaseService";
import UtilityService from "./UtilityService";
import WalletService from "./WalletService";


@Service()
export default class UserService extends BaseService {
    constructor(
        private log: Logger,
        private authenticationService: AuthenticationService,
        private walletService: WalletService,
        private adjutorService: AdjutorService
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

    public async fundWallet(amount: number): Promise<ServiceResponse> {
        try {
            const authParty: AuthenticatedParty = this.currentRequestHeaders["user"];
            
            const response = await this.walletService.fundWallet(authParty.accountNumber, amount);
            return response;
        } catch (err) {
            this.log.error("Could not fund wallet at this time", { err });
            return ServiceResponse.error(`Could not fund wallet at this time: ${err}`);
        }
    }

    public async withdrawFromWallet(amount: number): Promise<ServiceResponse> {
        try {
            const authParty: AuthenticatedParty = this.currentRequestHeaders["user"];

            const response = await this.walletService.withdrawFromWallet(authParty.accountNumber, amount);
            return response;
        } catch (err) {
            this.log.error("Could not withdraw from wallet at this time", { err });
            return ServiceResponse.error(`Could not withdraw from wallet at this time: ${err}`);
        }
    }

    public async transferToWallet(receiverAccountNumber: string, amount:number): Promise<ServiceResponse> {
        try {
            const authParty: AuthenticatedParty = this.currentRequestHeaders["user"];

            const fundsRecipient = await UserRepository.findByAccountNumber(receiverAccountNumber);
            if(!fundsRecipient) {
                return ServiceResponse.error("Wallet with account number does not exist", ResponseStatus.BAD_REQUEST);
            }

            if(receiverAccountNumber === authParty.accountNumber) {
                return ServiceResponse.error("You can't transfer to your own wallet", ResponseStatus.BAD_REQUEST);
            }

            const response = await this.walletService.transferBetweenWallets(authParty.accountNumber, receiverAccountNumber, amount);
            return response;
        } catch (err) {
            this.log.error("Could not complete transfer at this time", { err });
            return ServiceResponse.error(`Could not complete transfer at this time: ${err}`);
        }
    }

    // Run in the background after the user signs up. This checks the user's email address and phone number against the Adjutor Blacklist and blocks the user from using the platform if found culpable
    public async checkUserAgainstBlacklist(email:string, phoneNumber:string): Promise<ServiceResponse> {
        try {
            const existingUser = await UserRepository.findExisting(email, phoneNumber);
            if(!existingUser){
                return ServiceResponse.error("User with email or phone number does not exist", ResponseStatus.BAD_REQUEST);
            }

            const resourcePath = "verification/karma/";
            const emailLookupResponse = await this.adjutorService.getResource(`${resourcePath}${email}`);
            const phoneNumberLookup = await this.adjutorService.getResource(`${resourcePath}${phoneNumber}`);

            const isEmailFound = emailLookupResponse.status === ResponseStatus.OK;
            const isPhoneFound = phoneNumberLookup.status === ResponseStatus.OK;

            if(!isEmailFound && !isPhoneFound) {
                await UserRepository.updateUser(existingUser, { isApproved: true });
            }

            // Send email to user about approval status, successful or not

            return ServiceResponse.success("Verification complete");
        } catch (err) {
            this.log.error("Could not validate user at this time", { err });
            return ServiceResponse.error(`Could not validate user at this time: ${err}`);
        }
    }
}