import { LedgerRepository } from "../../../../src/api/repositories/LedgerRepository";
import { db } from "../../../../src/loaders/knexLoader";


jest.mock("../../../../src/loaders/knexLoader");

describe("LedgerRepository", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("addEntry", () => {
        // it("should insert ledger entries successfully", async () => {
        //     const ledgerEntries = [
        //         { accountNumber: "123", debit: 100, credit: 0 },
        //         { accountNumber: "456", debit: 0, credit: 50 },
        //     ];

        //     const mockTransaction = jest.fn().mockImplementationOnce((callback) => callback(db));
        //     db.transaction = mockTransaction;

        //     const mockInsert = jest.fn().mockResolvedValueOnce([1, 2]);
        //     db.insert = mockInsert;

        //     const result = await LedgerRepository.addEntry(ledgerEntries);

        //     expect(mockTransaction).toHaveBeenCalled();
        //     expect(db.insert).toHaveBeenCalledWith(ledgerEntries);
        //     expect(result).toEqual([1, 2]);
        // });

        it("should throw an error when inserting ledger entries fails", async () => {
            const ledgerEntries = [{ accountNumber: "123", debit: 100, credit: 0 }];
            const errorMessage = "Database error";

            const mockTransaction = jest.fn().mockImplementationOnce((callback) =>
                callback(db).catch(() => {
                    throw new Error(errorMessage);
                })
            );
            db.transaction = mockTransaction;

            await expect(LedgerRepository.addEntry(ledgerEntries)).rejects.toThrow(
                `Unable to insert Ledger entry: ${errorMessage}`
            );
        });
    });

    describe("getBalance", () => {
        it("should retrieve the account balance successfully", async () => {
            const accountNumber = "123";
            const balance = { balance: 1000 };

            db.raw = jest.fn().mockResolvedValueOnce({ rows: [balance] });

            const result = await LedgerRepository.getBalance(accountNumber);

            expect(db.raw).toHaveBeenCalledWith(
                "SELECT (SUM(credit) - SUM(debit)) as balance FROM ledger WHERE accountNumber = ? AND isReversed = false AND isDeleted = false",
                [accountNumber]
            );
            expect(result).toEqual({ rows: [balance] });
        });

        it("should throw an error when retrieving the account balance fails", async () => {
            const accountNumber = "123";
            const errorMessage = "Database error";

            db.raw = jest.fn().mockRejectedValueOnce(new Error(errorMessage));

            await expect(LedgerRepository.getBalance(accountNumber)).rejects.toThrow(
                `Unable to get account balance: ${errorMessage}`
            );
        });
    });
});