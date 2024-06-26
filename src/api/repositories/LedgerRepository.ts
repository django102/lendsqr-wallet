import { db } from "../../loaders/knexLoader";


class LedgerRepositoryInstance {
    tableName: string;

    constructor() {
        this.tableName = "ledger";
    }


    async addEntry(ledgerEntries) {
        try {
            await db.transaction(async (trx) => {
                const inserts = await trx(this.tableName).insert(ledgerEntries);
                return inserts;
            });
        } catch (err:any) {
            throw new Error(`Unable to insert Ledger entry: ${err.message}`);
        }
    }

    async getBalance(accountNumber) {
        try {
            const balance = await db.raw("SELECT (SUM(credit) - SUM(debit)) as balance FROM ledger WHERE accountNumber = ? AND isReversed = false AND isDeleted = false", [accountNumber]);
            return balance;
        } catch (err:any) {
            throw new Error(`Unable to get account balance: ${err.message}`);
        }
    }
}

const ledgerRepositoryInstance = new LedgerRepositoryInstance();
export const LedgerRepository = ledgerRepositoryInstance;