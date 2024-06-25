import { db } from "../../loaders/knexLoader";

class UserRepositoryInstance {
    tableName: string;

    constructor() {
        this.tableName = "users";
    }

    // Create a new user
    async create(user) {
        try {
            const [id] = await db(this.tableName).insert(user);
            return { id, ...user };
        } catch (err: any) {
            throw new Error(`Unable to create user: ${err.message}`);
        }
    }

    // Find a user by email
    async findByEmail(email) {
        try {
            const user = await db(this.tableName)
                .where({ email })
                .first();
                // Adjust withGraphFetched if necessary for related data
            return user;
        } catch (err: any) {
            throw new Error(`Unable to retrieve user by email: ${err.message}`);
        }
    }

    // Find a user by id
    async findById(id) {
        try {
            const user = await db(this.tableName)
                .where({ id })
                .first();
                // Adjust withGraphFetched if necessary for related data
            return user;
        } catch (err: any) {
            throw new Error(`Unable to retrieve user by id: ${err.message}`);
        }
    }

    // Find existing user by email and phoneNumber
    async findExisting(email:string, phoneNumber: string) {
        const user = await db(this.tableName)
            .where({ phoneNumber })
            .orWhere({ email })
            .first();
        return user;
    }

    // Update a user
    async updateUser(user, updateData) {
        try {
            await db(this.tableName)
                .where({ id: user.id })
                .update(updateData);
            return { ...user, ...updateData };
        } catch (err: any) {
            throw new Error(`Unable to update user: ${err.message}`);
        }
    }
}

// Ensure the UserRepository is a singleton
const userRepositoryInstance = new UserRepositoryInstance();
// Container.set("UserRepository", userRepositoryInstance);

export const UserRepository = userRepositoryInstance;