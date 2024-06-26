import { ResponseStatus } from "../../../../src/api/enums/ResponseStatus";
import { UserRepository } from "../../../../src/api/repositories/UserRepository";
import { ServiceResponse } from "../../../../src/api/responses";
import AdjutorService from "../../../../src/api/services/AdjutorService";
import AuthenticationService from "../../../../src/api/services/AuthenticationService";
import UserService from "../../../../src/api/services/UserService";
import UtilityService from "../../../../src/api/services/UtilityService";
import WalletService from "../../../../src/api/services/WalletService";
import UserServiceMock from "../../../../test/mocks/services/UserServiceMock";


describe("UserService", () => {
    let userService: UserService;
    let authenticationService: AuthenticationService;
    let walletService: WalletService;
    let adjutorService: AdjutorService;

    const mockUser = {
        email: "example@example.com",
        firstName: "first",
        lastName: "last",
        phoneNumber: "00000",
        password: "hashedPassword",
        accountNumber: "0000012346"
    };

    const headers = {
        user: {
            email: "example@example.com",
            firstName: "first",
            lastName: "last",
            id: 1,
            accountNumber: "0000012345",
            phoneNumber: "00000000000"
        },
    };


    beforeAll(()=>{
        userService = UserServiceMock.getInstance();
        authenticationService = UserServiceMock.authenticationService;
        walletService = UserServiceMock.walletService;
        adjutorService = UserServiceMock.adjutorService;
    });

    afterEach(()=>{
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });


    describe("should be defined", ()=>{
        it("should be defined", ()=>{
            expect(userService).toBeDefined();
        });
    });


    describe("createUser", ()=>{
        let createUserMock : jest.SpyInstance;
        let findExistingUser : jest.SpyInstance;

        beforeEach(()=>{
            createUserMock = jest.spyOn(UserRepository, "create");
            findExistingUser = jest.spyOn(UserRepository, "findExisting");
        });

        const resolvedCreateduser = { ...mockUser, id: 1, createdAt: new Date() };

        it("should create a user successfully", async () => {
            createUserMock.mockResolvedValue(resolvedCreateduser);
            findExistingUser.mockResolvedValue(null);

            const createduser = await userService.createUser(mockUser);

            expect(createUserMock).toHaveBeenCalledTimes(1);
            expect(findExistingUser).toHaveBeenCalledTimes(1);
            expect(createduser.code).toEqual(ResponseStatus.CREATED);
            expect(createduser.data).toEqual(resolvedCreateduser);
        });

        it("should fail if a user already exists", async () => {
            createUserMock.mockResolvedValue(resolvedCreateduser);
            findExistingUser.mockResolvedValue(resolvedCreateduser);

            const createduser = await userService.createUser(mockUser);

            expect(createUserMock).toHaveBeenCalledTimes(0);
            expect(findExistingUser).toHaveBeenCalledTimes(1);
            expect(createduser.code).toEqual(ResponseStatus.BAD_REQUEST);
        });

        it("should fail while trying to create a user", async () => {
            createUserMock.mockRejectedValue("something happened!!!");
            findExistingUser.mockResolvedValue(null);

            const createduser = await userService.createUser(mockUser);

            expect(createUserMock).toHaveBeenCalledTimes(1);
            expect(findExistingUser).toHaveBeenCalledTimes(1);
            expect(createduser.code).toEqual(ResponseStatus.INTERNAL_SERVER_ERROR);
            expect(createduser.data).toBeUndefined();
        });
    });

    describe("login", () => {
        let getUserByEmailMock : jest.SpyInstance;
        const mockToken = "mockToken";   

        beforeEach(()=>{
            getUserByEmailMock = jest.spyOn(UserRepository, "findByEmail");
        });

        it("should successfully login", async () => {
            getUserByEmailMock.mockResolvedValue(mockUser);
            UtilityService.comparePassword = jest.fn().mockResolvedValue(true);
            authenticationService.issueToken = jest.fn().mockReturnValue(mockToken);
    
            const email = "example@example.com";
            const password = "password123";
    
            const response = await userService.login(email, password);

            expect(getUserByEmailMock).toHaveBeenCalledTimes(1);
            expect(response.code).toEqual(ResponseStatus.OK);
            expect(response.data).toEqual({ user: mockUser, token: mockToken });
        });
    
        it("should return error for invalid email", async () => {
            getUserByEmailMock.mockResolvedValue(null);
    
            const email = "invalid@example.com";
            const password = "invalidPassword";
    
            const response = await userService.login(email, password);

            expect(getUserByEmailMock).toHaveBeenCalledTimes(1);
            expect(response.code).toEqual(ResponseStatus.UNAUTHORIZED);
            expect(response.data).toBeUndefined();
        });

        it("should return error for invalid password", async () => {
            getUserByEmailMock.mockResolvedValue(mockUser);
            UtilityService.comparePassword = jest.fn().mockResolvedValue(false);
    
            const email = "invalid@example.com";
            const password = "invalidPassword";
    
            const response = await userService.login(email, password);

            expect(getUserByEmailMock).toHaveBeenCalledTimes(1);
            expect(response.code).toEqual(ResponseStatus.UNAUTHORIZED);
            expect(response.data).toBeUndefined();
        });
    
        it("should handle error during login", async () => {
            getUserByEmailMock.mockRejectedValue(new Error("Database error"));
    
            const email = "example@example.com";
            const password = "password123";
    
            const response = await userService.login(email, password);

            expect(getUserByEmailMock).toHaveBeenCalledTimes(1);
            expect(response.code).toEqual(ResponseStatus.INTERNAL_SERVER_ERROR);
            expect(response.data).toBeUndefined();
        });
    });

    describe("fundWallet", () => {
        beforeAll(() => {
            userService.setCurrentRequestHeaders(headers);
        });

        it("should successfully fund user wallet", async () => {
            const fundWalletMock = jest.spyOn(walletService, "fundWallet").mockResolvedValue(new ServiceResponse(true, ResponseStatus.OK, "Successful"));

            const response = await userService.fundWallet(200);

            expect(fundWalletMock).toHaveBeenCalledTimes(1);
            expect(fundWalletMock).toHaveBeenCalledWith(headers.user.accountNumber, 200);
            expect(response.code).toEqual(ResponseStatus.OK);
        });

        it("should handle error during user wallet funding", async () => {
            const fundWalletMock = jest.spyOn(walletService, "fundWallet").mockRejectedValue(new Error("Database error"));
    
            const response = await userService.fundWallet(200);

            expect(fundWalletMock).toHaveBeenCalledTimes(1);
            expect(fundWalletMock).toHaveBeenCalledWith(headers.user.accountNumber, 200);
            expect(response.code).toEqual(ResponseStatus.INTERNAL_SERVER_ERROR);
            expect(response.data).toBeUndefined();
        });
    });

    describe("withdrawFromWallet", () => {
        beforeAll(() => {
            userService.setCurrentRequestHeaders(headers);
        });

        it("should successfully withdraw from user wallet", async () => {
            const fundWalletMock = jest.spyOn(walletService, "withdrawFromWallet").mockResolvedValue(new ServiceResponse(true, ResponseStatus.OK, "Successful"));

            const response = await userService.withdrawFromWallet(200);

            expect(fundWalletMock).toHaveBeenCalledTimes(1);
            expect(fundWalletMock).toHaveBeenCalledWith(headers.user.accountNumber, 200);
            expect(response.code).toEqual(ResponseStatus.OK);
        });

        it("should handle error during user wallet withdrawal", async () => {
            const fundWalletMock = jest.spyOn(walletService, "withdrawFromWallet").mockRejectedValue(new Error("Database error"));
    
            const response = await userService.withdrawFromWallet(200);

            expect(fundWalletMock).toHaveBeenCalledTimes(1);
            expect(fundWalletMock).toHaveBeenCalledWith(headers.user.accountNumber, 200);
            expect(response.code).toEqual(ResponseStatus.INTERNAL_SERVER_ERROR);
            expect(response.data).toBeUndefined();
        });
    });

    describe("transferBetweenWallets", () => {
        beforeAll(() => {
            userService.setCurrentRequestHeaders(headers);
        });

        afterEach(() => {
            jest.resetAllMocks();
        });

        it("should successfully transfer funds between user wallets", async () => {
            const findReceipientAccountMock = jest.spyOn(UserRepository, "findByAccountNumber").mockResolvedValue(mockUser);
            const transferBetweenWalletsMock = jest.spyOn(walletService, "transferBetweenWallets").mockResolvedValue(new ServiceResponse(true, ResponseStatus.OK, "Successful"));

            const response = await userService.transferToWallet(mockUser.accountNumber, 200);

            expect(findReceipientAccountMock).toHaveBeenCalledTimes(1);
            expect(transferBetweenWalletsMock).toHaveBeenCalledTimes(1);
            expect(transferBetweenWalletsMock).toHaveBeenCalledWith(headers.user.accountNumber, mockUser.accountNumber, 200);
            expect(response.code).toEqual(ResponseStatus.OK);
        });

        it("should fail if receiver account number doesn't exist", async () => {
            const findReceipientAccountMock = jest.spyOn(UserRepository, "findByAccountNumber").mockResolvedValue(null);
            const transferBetweenWalletsMock = jest.spyOn(walletService, "transferBetweenWallets").mockResolvedValue(new ServiceResponse(true, ResponseStatus.OK, "Successful"));

            const response = await userService.transferToWallet(mockUser.accountNumber, 200);

            expect(findReceipientAccountMock).toHaveBeenCalledTimes(1);
            expect(transferBetweenWalletsMock).not.toHaveBeenCalled();
            expect(response.code).toEqual(ResponseStatus.BAD_REQUEST);
        });

        it("should fail if receiver account number is the same as the sender account number", async () => {
            const sameAccountMock = { ...mockUser, accountNumber: headers.user.accountNumber };
            const findReceipientAccountMock = jest.spyOn(UserRepository, "findByAccountNumber").mockResolvedValue(sameAccountMock);
            const transferBetweenWalletsMock = jest.spyOn(walletService, "transferBetweenWallets").mockResolvedValue(new ServiceResponse(true, ResponseStatus.OK, "Successful"));

            const response = await userService.transferToWallet(sameAccountMock.accountNumber, 200);

            expect(findReceipientAccountMock).toHaveBeenCalledTimes(1);
            expect(transferBetweenWalletsMock).not.toHaveBeenCalled();
            expect(response.code).toEqual(ResponseStatus.BAD_REQUEST);
        });

        it("should handle error during user wallet withdrawal", async () => {
            const findReceipientAccountMock = jest.spyOn(UserRepository, "findByAccountNumber").mockResolvedValue(mockUser);
            const transferBetweenWalletsMock = jest.spyOn(walletService, "transferBetweenWallets").mockRejectedValue(new Error("Database error"));
    
            const response = await userService.transferToWallet(mockUser.accountNumber, 200);

            expect(findReceipientAccountMock).toHaveBeenCalledTimes(1);
            expect(transferBetweenWalletsMock).toHaveBeenCalledTimes(1);
            expect(transferBetweenWalletsMock).toHaveBeenCalledWith(headers.user.accountNumber, mockUser.accountNumber, 200);
            expect(response.code).toEqual(ResponseStatus.INTERNAL_SERVER_ERROR);
            expect(response.data).toBeUndefined();
        });
    });

    describe("checkUserAgainstBlacklist", () => {
        let findExistingUser : jest.SpyInstance;
        let updateUser: jest.SpyInstance;
        let getAxiosResource: jest.SpyInstance;


        beforeEach(() => {
            findExistingUser = jest.spyOn(UserRepository, "findExisting");
            updateUser = jest.spyOn(UserRepository, "updateUser");
            getAxiosResource = jest.spyOn(adjutorService, "getResource");
        });
      
        afterEach(() => {
            jest.clearAllMocks();
        });
        
        it("should return an error if the user does not exist", async () => {
            const email = "test@example.com";
            const phoneNumber = "1234567890";
    
            findExistingUser.mockResolvedValueOnce(null);
    
            const response = await userService.checkUserAgainstBlacklist(email, phoneNumber);
    
            expect(findExistingUser).toHaveBeenCalledWith(email, phoneNumber);
            expect(response).toEqual(ServiceResponse.error("User with email or phone number does not exist", ResponseStatus.BAD_REQUEST));
        });
    
        it("should update the user as approved if the user is not found in the blacklist", async () => {
            const email = "test@example.com";
            const phoneNumber = "1234567890";
            const existingUser = { id: 1, email, phoneNumber, isApproved: false };
    
            findExistingUser.mockResolvedValueOnce(existingUser);
            getAxiosResource
                .mockImplementationOnce(() => { return { status: ResponseStatus.NOT_FOUND, data: null }; })
                .mockImplementationOnce(() => { return { status: ResponseStatus.NOT_FOUND, data: null }; });
                
            updateUser.mockResolvedValueOnce(existingUser);
    
            const response = await userService.checkUserAgainstBlacklist(email, phoneNumber);
    
            expect(findExistingUser).toHaveBeenCalledWith(email, phoneNumber);
            expect(getAxiosResource).toHaveBeenCalledWith("verification/karma/test@example.com");
            expect(getAxiosResource).toHaveBeenCalledWith("verification/karma/1234567890");
            expect(updateUser).toHaveBeenCalledWith(existingUser, { isApproved: true });
            expect(response).toEqual(ServiceResponse.success("Verification complete"));
        });
    
        it("should return an error if the user is found in the blacklist", async () => {
            const email = "test@example.com";
            const phoneNumber = "1234567890";
            const existingUser = { id: 1, email, phoneNumber, isApproved: false };
    
            findExistingUser.mockResolvedValueOnce(existingUser);
            getAxiosResource
                .mockResolvedValueOnce({ status: ResponseStatus.OK, data: { isBlacklisted: true } })
                .mockResolvedValueOnce({ status: ResponseStatus.OK, data: { isBlacklisted: true } });
    
            const response = await userService.checkUserAgainstBlacklist(email, phoneNumber);
    
            expect(findExistingUser).toHaveBeenCalledWith(email, phoneNumber);
            expect(getAxiosResource).toHaveBeenCalledWith("verification/karma/test@example.com");
            expect(getAxiosResource).toHaveBeenCalledWith("verification/karma/1234567890");
            expect(updateUser).not.toHaveBeenCalled();
            expect(response.code).toEqual(ResponseStatus.OK);
        });
    
        it("should return an error if an unexpected error occurs", async () => {
            const email = "test@example.com";
            const phoneNumber = "1234567890";
            const existingUser = { id: 1, email, phoneNumber, isApproved: false };
            const errorMessage = "Unexpected error";
    
            findExistingUser.mockResolvedValueOnce(existingUser);
            getAxiosResource.mockRejectedValueOnce(new Error(errorMessage));
    
            const response = await userService.checkUserAgainstBlacklist(email, phoneNumber);
    
            expect(findExistingUser).toHaveBeenCalledWith(email, phoneNumber);
            expect(getAxiosResource).toHaveBeenCalledTimes(1);
            expect(updateUser).not.toHaveBeenCalled();
            expect(response).toEqual(ServiceResponse.error(`Could not validate user at this time: Error: ${errorMessage}`));
        });
    });
});