import { TransactionType } from "../../enums/TransactionType";

interface Ledger {
    id?: number;
    reference: string;
    accountNumber: string;
    transactionType: TransactionType;
    description?:string;
    credit:number;
    debit:number;
    isReversed?:boolean;
    isDeleted?:boolean;
    transactionDate: Date;
}

export default Ledger;