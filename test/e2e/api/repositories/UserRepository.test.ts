import { UserRepository } from "../../../../src/api/repositories/UserRepository";
import { db } from "../../../../src/loaders/knexLoader";

jest.mock("../../../../src/loaders/knexLoader", () => {
    const mDb = {
        insert: jest.fn(),
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        first: jest.fn(),
        update: jest.fn(),
    };
    return { db: jest.fn(() => mDb) };
});

describe("UserRepository", () => {
    let mockDb;

    beforeEach(() => {
        mockDb = db();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });


    describe("create", () => {
        const newUser = { email: "new@example.com", firstName: "me", lastName: "you", password: "xyz", phoneNumber: "0000000000" };

        it("should create a user", async () => {
            mockDb.insert.mockResolvedValue([1]);
        
            const createdUser = await UserRepository.create(newUser);

            expect(db).toHaveBeenCalledWith("users");
            expect(mockDb.insert).toHaveBeenCalledWith(newUser);
            expect(createdUser).toEqual({ id: 1, ...newUser });
        });
    });

    describe("findByEmail", () => {
        it("should find a user by email", async () => {
            const mockUser = { id: 1, email: "test@example.com", name: "Test User" };
            mockDb.first.mockResolvedValueOnce(mockUser);
        
            const result = await UserRepository.findByEmail("test@example.com");
            expect(result).toEqual(mockUser);
            expect(db).toHaveBeenCalledWith("users");
            expect(mockDb.where).toHaveBeenCalledWith({ email: "test@example.com" });
            expect(mockDb.first).toHaveBeenCalled();
        });
    });

    describe("findById", () => {
        it("should find a user by id", async () => {
            const mockUser = { id: 1, email: "test@example.com", name: "Test User" };
            mockDb.first.mockResolvedValueOnce(mockUser);
        
            const result = await UserRepository.findById(1);
            expect(result).toEqual(mockUser);
            expect(db).toHaveBeenCalledWith("users");
            expect(mockDb.where).toHaveBeenCalledWith({ id: 1 });
            expect(mockDb.first).toHaveBeenCalled();
        });
    });

    describe("findExisting", () => {
        it("should find an existing user by email or phone number", async () => {
            const mockUser = { id: 1, email: "test@example.com", phoneNumber: "1234567890", name: "Test User" };
            mockDb.first.mockResolvedValueOnce(mockUser);
        
            const result = await UserRepository.findExisting("test@example.com", "1234567890");
            expect(result).toEqual(mockUser);
            expect(db).toHaveBeenCalledWith("users");
            expect(mockDb.where).toHaveBeenCalledWith({ phoneNumber: "1234567890" });
            expect(mockDb.orWhere).toHaveBeenCalledWith({ email: "test@example.com" });
            expect(mockDb.first).toHaveBeenCalled();
        });
    });

    describe("updateUser", () => {
        it("should update a user", async () => {
            const mockUser = { id: 1, email: "test@example.com", name: "Test User" };
            const updateData = { name: "Updated User" };
            mockDb.update.mockResolvedValueOnce(1);
        
            const result = await UserRepository.updateUser(mockUser, updateData);
            expect(result).toEqual({ ...mockUser, ...updateData });
            expect(db).toHaveBeenCalledWith("users");
            expect(mockDb.where).toHaveBeenCalledWith({ id: mockUser.id });
            expect(mockDb.update).toHaveBeenCalledWith(updateData);
        });
    }); 
});