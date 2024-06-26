import { IsNumber } from "class-validator";


export default class WalletRequest {
    @IsNumber({}, { message: "Amount is required" })
        amount: number;
}