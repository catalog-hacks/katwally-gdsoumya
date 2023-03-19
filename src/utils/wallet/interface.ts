import {BigNumber, FixedNumber} from 'ethers';

export interface IWallet {
    getBalance(
        accountNumber: number,
        blockTag?: number | undefined,
    ): Promise<FixedNumber>;
    getAddress(accountNumber: number): Promise<string>;
    getPubKey(accountNumber: number): string;
    getPrivKey(accountNumber: number): string;
    sendTokens(
        accountNumber: number,
        recipientAddress: string,
        amount: string,
    ): Promise<TransactionData>;
    getChainType(): ChainType;
}

export enum ChainType {
    EVM = 'ETH',
    BTC = 'BTC',
    SOLANA = 'SOL',
}

export interface TransactionData {
    transactionHash: string;
    gasUsed: BigNumber;
}
