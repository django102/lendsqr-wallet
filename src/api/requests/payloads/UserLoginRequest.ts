import { IsEmail, IsString } from "class-validator";


export default class UserLoginRequest {
    @IsString({ message: "Email is required" })
    @IsEmail({}, { message: "Email must be a valid email" })
        email: string;

    @IsString({ message: "Password is required" })
        password: string;
}