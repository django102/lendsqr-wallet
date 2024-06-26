import { ResponseStatus } from "../../../../src/api/enums/ResponseStatus";
import { TransactionType } from "../../../../src/api/enums/TransactionType";
import LedgerService from "../../../../src/api/services/LedgerService";
import WalletService from "../../../../src/api/services/WalletService";
import WalletServiceMock from "../../../../test/mocks/services/WalletServiceMock";


describe("WalletService", () => {
    let walletService: WalletService;
    let ledgerService: LedgerService;
    const headers = { user: { email: "example@example.com", firstName: "first", lastName: "last", id: 1, password: "pass", phoneNumber: "00" } };

    beforeAll(()=>{
        walletService = WalletServiceMock.getInstance();
        ledgerService = WalletServiceMock.ledgerService;
        walletService.setCurrentRequestHeaders(headers);
    });

    afterEach(()=>{
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });


    describe("should be defined", ()=>{
        it("should be defined", ()=>{
            expect(walletService).toBeDefined();
        });
    });


    describe("fundWallet", () => {
        const wallet = { userId: 1, accountNumber: "0000012345", };
        const ledger = { accountNumber: "0000000000", credit: 10000, debit: 0, reference: "myRef", transactionType: TransactionType.FUNDING, description: "something", transactionDate: new Date() };

        it("should successfully fund user wallet", async () => {
            const addEntryMock = jest.spyOn(ledgerService, "addLedgerEntry").mockResolvedValue([ledger, ledger]);

            const response = await walletService.fundWallet(wallet.accountNumber, 20000);

            expect(addEntryMock).toHaveBeenCalled();
            expect(response.code).toEqual(ResponseStatus.OK);
        });

        it("should throw an error while funding wallet", async () => {
            const addEntryMock = jest.spyOn(ledgerService, "addLedgerEntry").mockRejectedValue("something happened!!!");

            const response = await walletService.fundWallet(wallet.accountNumber, 20000);

            expect(addEntryMock).toHaveBeenCalled();
            expect(response.code).toEqual(ResponseStatus.INTERNAL_SERVER_ERROR);
            expect(response.data).toBeUndefined();
        });
    });

    describe("withdrawFromWallet", () => {
        const wallet = { userId: 1, accountNumber: "0000012345", };
        const balance = { accountNumber: wallet.accountNumber, availableBalance: 30000, ledgerBalance: 30000 };
        const ledger = { accountNumber: "0000000000", credit: 10000, debit: 0, reference: "myRef", transactionType: TransactionType.FUNDING, description: "something", transactionDate: new Date() };

        it("should successfully withdraw from user wallet", async () => {
            const getBalanceMock = jest.spyOn(ledgerService, "getAccountBalance").mockResolvedValue(balance);
            const addEntryMock = jest.spyOn(ledgerService, "addLedgerEntry").mockResolvedValue([ledger, ledger]);

            const response = await walletService.withdrawFromWallet(wallet.accountNumber, 20000);

            expect(getBalanceMock).toHaveBeenCalledWith(wallet.accountNumber);
            expect(addEntryMock).toHaveBeenCalled();
            expect(response.code).toEqual(ResponseStatus.OK);
        });

        it("should return insufficient funds if wallet balance is less than withdrawal amount", async () => {
            const getBalanceMock = jest.spyOn(ledgerService, "getAccountBalance").mockResolvedValue({ ...balance, availableBalance: 5000 });
            const addEntryMock = jest.spyOn(ledgerService, "addLedgerEntry").mockResolvedValue([ledger, ledger]);

            const response = await walletService.withdrawFromWallet(wallet.accountNumber, 20000);

            expect(getBalanceMock).toHaveBeenCalledWith(wallet.accountNumber);
            expect(addEntryMock).not.toHaveBeenCalled();
            expect(response.code).toEqual(ResponseStatus.BAD_REQUEST);
            expect(response.message).toEqual("Insufficient funds");
        });

        it("should throw an error while withdrawing from wallet", async () => {
            const getBalanceMock = jest.spyOn(ledgerService, "getAccountBalance").mockResolvedValue(balance);
            const addEntryMock = jest.spyOn(ledgerService, "addLedgerEntry").mockRejectedValue("something happened!!!");

            const response = await walletService.withdrawFromWallet(wallet.accountNumber, 20000);

            expect(getBalanceMock).toHaveBeenCalledWith(wallet.accountNumber);
            expect(addEntryMock).toHaveBeenCalled();
            expect(response.code).toEqual(ResponseStatus.INTERNAL_SERVER_ERROR);
            expect(response.data).toBeUndefined();
        });
    });

    describe("transferBetweenWallets", () => {
        const wallet1 = { userId: 1, accountNumber: "0000012345", };
        const wallet2 = { userId: 1, accountNumber: "0000012346", };
        const balance = { accountNumber: wallet1.accountNumber, availableBalance: 30000, ledgerBalance: 30000 };
        const ledger = { accountNumber: "0000000000", credit: 10000, debit: 0, reference: "myRef", transactionType: TransactionType.FUNDING, description: "something", transactionDate: new Date() };

        it("should successfully transfer between wallets", async () => {
            const getBalanceMock = jest.spyOn(ledgerService, "getAccountBalance").mockResolvedValue(balance);
            const addEntryMock = jest.spyOn(ledgerService, "addLedgerEntry").mockResolvedValue([ledger, ledger]);

            const response = await walletService.transferBetweenWallets(wallet1.accountNumber, wallet2.accountNumber, 20000);

            expect(getBalanceMock).toHaveBeenCalledWith(wallet1.accountNumber);
            expect(addEntryMock).toHaveBeenCalled();
            expect(response.code).toEqual(ResponseStatus.OK);
        });

        it("should return insufficient funds if wallet balance is less than withdrawal amount", async () => {
            const getBalanceMock = jest.spyOn(ledgerService, "getAccountBalance").mockResolvedValue({ ...balance, availableBalance: 5000 });
            const addEntryMock = jest.spyOn(ledgerService, "addLedgerEntry").mockResolvedValue([ledger, ledger]);

            const response = await walletService.transferBetweenWallets(wallet1.accountNumber, wallet2.accountNumber, 20000);

            expect(getBalanceMock).toHaveBeenCalledWith(wallet1.accountNumber);
            expect(addEntryMock).not.toHaveBeenCalled();
            expect(response.code).toEqual(ResponseStatus.BAD_REQUEST);
            expect(response.message).toEqual("Insufficient funds");
        });

        it("should throw an error while transfering between wallets", async () => {
            const getBalanceMock = jest.spyOn(ledgerService, "getAccountBalance").mockResolvedValue(balance);
            const addEntryMock = jest.spyOn(ledgerService, "addLedgerEntry").mockRejectedValue("something happened!!!");

            const response = await walletService.transferBetweenWallets(wallet1.accountNumber, wallet2.accountNumber, 20000);

            expect(getBalanceMock).toHaveBeenCalledWith(wallet1.accountNumber);
            expect(addEntryMock).toHaveBeenCalled();
            expect(response.code).toEqual(ResponseStatus.INTERNAL_SERVER_ERROR);
            expect(response.data).toBeUndefined();
        });
    });
});