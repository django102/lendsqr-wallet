import UserService from "../../../src/api/services/UserService";
import { LogMock } from "../../../src/utils/test/unit/LogMock";

export default class UserServiceMock {
    public static logger = new LogMock();

    public static getInstance(
    ): UserService {
        return new UserService(
            this.logger,
        );
    }
}