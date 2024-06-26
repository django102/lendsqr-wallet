import { TransactionType } from "../../../../src/api/enums/TransactionType";
import { LedgerRepository } from "../../../../src/api/repositories/LedgerRepository";
import LedgerService from "../../../../src/api/services/LedgerService";
import LedgerServiceMock from "../../../../test/mocks/services/LedgerServiceMock";

describe("LedgerService", () => {
    let ledgerService: LedgerService;

    beforeAll(()=>{
        ledgerService = LedgerServiceMock.getInstance();
    });

    afterEach(()=>{
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });


    describe("should be defined", ()=>{
        it("should be defined", ()=>{
            expect(ledgerService).toBeDefined();
        });
    });


    describe("getAccountBalance", () => {
        it("should get account balance", async () => {
            const getAccountBalanceMock = jest.spyOn(LedgerRepository, "getBalance").mockResolvedValue(30000);
            const accountNumber = "0000012345";

            const result = await ledgerService.getAccountBalance(accountNumber);

            expect(getAccountBalanceMock).toHaveBeenCalledWith(accountNumber);
            expect(result).toEqual({ accountNumber, availableBalance: 30000, ledgerBalance: 30000 });
        });
    });

    describe("addLedgerEntry", () => {
        it("should successfully add both sides of a ledger entry", async () => {
            const ledger = { accountNumber: "0000000000", credit: 10000, debit: 0, reference: "myRef", transactionType: TransactionType.FUNDING, description: "something", transactionDate: new Date() };
            const addEntriesMock = jest.spyOn(LedgerRepository, "addEntry").mockResolvedValue();

            await ledgerService.addLedgerEntry([ledger, ledger]);

            expect(addEntriesMock).toHaveBeenCalledWith([ledger, ledger]);
        });
    });
});