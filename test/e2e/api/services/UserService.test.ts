import { ResponseStatus } from "../../../../src/api/enums/ResponseStatus";
import { UserRepository } from "../../../../src/api/repositories/UserRepository";
import UserService from "../../../../src/api/services/UserService";
import UserServiceMock from "../../../../test/mocks/services/UserServiceMock";


describe("UserService", () => {
    let userService: UserService;

    const mockUser = {
        email: "example@example.com",
        firstName: "first",
        lastName: "last",
        phoneNumber: "00000",
        password: "hashedPassword",
    };

    beforeAll(()=>{
        userService = UserServiceMock.getInstance();
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
});