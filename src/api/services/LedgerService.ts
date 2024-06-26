import { Service } from "typedi";

import LedgerAccountBalance from "../models/LedgerAccountBalance";
import Ledger from "../models/mysql/Ledger";
import { LedgerRepository } from "../repositories/LedgerRepository";

@Service()
export default class LedgerService{
    constructor(){}

    public async getAccountBalance(accountNumber: string): Promise<LedgerAccountBalance> {
        const balance = await LedgerRepository.getBalance(accountNumber);

        const ledgerAccountBalance: LedgerAccountBalance = {
            accountNumber,
            availableBalance: balance,
            ledgerBalance: balance
        };

        return ledgerAccountBalance;
    }

    public async addLedgerEntry(entries: Ledger[]): Promise<Ledger[] | void> {
        await LedgerRepository.addEntry(entries);
        return;
    }
}