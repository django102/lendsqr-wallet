import AsyncLock from "async-lock";
import moment from "moment";
import { Service } from "typedi";

import { Logger } from "../../lib/logger";
import { ResponseStatus } from "../enums/ResponseStatus";
import { TransactionType, TransactionTypeAccount } from "../enums/TransactionType";
import Ledger from "../models/mysql/Ledger";
import { ServiceResponse } from "../responses";

import BaseService from "./BaseService";
import LedgerService from "./LedgerService";


@Service()
export default class WalletService extends BaseService {
    constructor(
        private log: Logger,
        private ledgerService: LedgerService
    ) {
        super();
    }

    private lock = new AsyncLock();


    public async fundWallet(accountNumber: string, amount: number): Promise<ServiceResponse> {
        try {            
            // You can check any account limits for the wallet whenever they are implemented

            const reference = moment().format("yyyyMMDDHHmmssSSSSSS");

            const creditLedgerEntry: Ledger = {
                accountNumber,
                credit: amount,
                debit: 0,
                description: `Funding of account ${accountNumber}`,
                reference,
                transactionType: TransactionType.FUNDING,
                transactionDate: new Date()
            };

            const debitLedgerEntry: Ledger = {
                accountNumber: TransactionTypeAccount.FUNDING,
                credit: 0,
                debit: amount,
                description: `Funding of account ${accountNumber}`,
                reference,
                transactionType: TransactionType.FUNDING,
                transactionDate: new Date()
            };

            await this.ledgerService.addLedgerEntry([creditLedgerEntry, debitLedgerEntry]);

            return ServiceResponse.success("Wallet successfully funded");
        } catch (err) {
            this.log.error("Could not fund user wallet", { err });
            return ServiceResponse.error(`Could not fund user wallet: ${err}`);
        }
    }

    public async withdrawFromWallet(accountNumber: string, amount: number): Promise<ServiceResponse> {
        return await this.lock.acquire(accountNumber, async () => {
            try {
                // You can check any account limits for the wallet whenever they are implemented
                const walletBalance = await this.ledgerService.getAccountBalance(accountNumber);
                if (walletBalance.availableBalance < amount) {
                    return ServiceResponse.error("Insufficient funds", ResponseStatus.BAD_REQUEST);
                }

                const reference = moment().format("yyyyMMDDHHmmssSSSSSS");

                const debitLedgerEntry: Ledger = {
                    accountNumber,
                    credit: 0,
                    debit: amount,
                    description: `Withdrawal from account ${accountNumber}`,
                    reference,
                    transactionType: TransactionType.WITHDRAWAL,
                    transactionDate: new Date()
                };

                const creditLedgerEntry: Ledger = {
                    accountNumber: TransactionTypeAccount.WITHDRAWAL,
                    credit: amount,
                    debit: 0,
                    description: `Withdrawal from account ${accountNumber}`,
                    reference,
                    transactionType: TransactionType.WITHDRAWAL,
                    transactionDate: new Date()
                };

                await this.ledgerService.addLedgerEntry([creditLedgerEntry, debitLedgerEntry]);

                // Run other process to actually transfer to the bank account of choice. 
                // Implement reversal for when it fails...probably have a nested try/catch for this...or figure out how to wrap everything in a transaction.
                
                return ServiceResponse.success("Wallet withdrawal successful");
            } catch (err) {
                this.log.error("Could not withdraw from user wallet", { err });
                return ServiceResponse.error(`Could not withdraw from user wallet: ${err}`);
            }
        }); 
    }

    public async transferBetweenWallets(sourceAccountNumber: string, destinationAccountNumber: string, amount): Promise<ServiceResponse> {
        return await this.lock.acquire(sourceAccountNumber, async () => {
            try {
                // const sourceWallet = await WalletRepository.findByAccountNumber(sourceAccountNumber);
                // if(!sourceWallet) {
                //     return ServiceResponse.error("Source wallet does not exist", ResponseStatus.BAD_REQUEST);
                // }
    
                // if(sourceAccountNumber === destinationAccountNumber) {
                //     return ServiceResponse.error("Source wallet and destination wallet cannot be the same", ResponseStatus.BAD_REQUEST);
                // }
    
                // const destinationWallet = await WalletRepository.findByAccountNumber(destinationAccountNumber);
                // if(!destinationWallet) {
                //     return ServiceResponse.error("Destination wallet does not exist", ResponseStatus.BAD_REQUEST);
                // }
    
                const sourceWalletBalance = await this.ledgerService.getAccountBalance(sourceAccountNumber);
                if(sourceWalletBalance.availableBalance < amount) {
                    return ServiceResponse.error("Insufficient funds", ResponseStatus.BAD_REQUEST);
                }
    
    
                const reference = moment().format("yyyyMMDDHHmmssSSSSSS");
    
                const creditLedgerEntry: Ledger = {
                    accountNumber: destinationAccountNumber,
                    credit: amount,
                    debit: 0,
                    description: `Transfer between accounts -  ${sourceAccountNumber} >> ${destinationAccountNumber}`,
                    reference,
                    transactionType: TransactionType.WALLET_TRANSFER,
                    transactionDate: new Date()
                };
    
                const debitLedgerEntry: Ledger = {
                    accountNumber: sourceAccountNumber,
                    credit: 0,
                    debit: amount,
                    description: `Transfer between accounts -  ${sourceAccountNumber} >> ${destinationAccountNumber}`,
                    reference,
                    transactionType: TransactionType.WALLET_TRANSFER,
                    transactionDate: new Date()
                };
    
                await this.ledgerService.addLedgerEntry([creditLedgerEntry, debitLedgerEntry]);
    
                return ServiceResponse.success("Wallet transfer successful");
            } catch (err) {
                this.log.error("Could not transfer funds between wallets", { err });
                return ServiceResponse.error(`Could not transfer funds between wallets: ${err}`);
            }
        });
    }

    // implement transfer to other banks and payment of bills
}