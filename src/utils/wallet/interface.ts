import {BigNumber} from 'ethers';

export interface IWallet {
  getBalance(
    accountNumber: number,
    blockTag: number | undefined,
  ): Promise<BigNumber>;
  getAddress(accountNumber: number): string;
  getPubKey(accountNumber: number): string;
  getPrivKey(accountNumber: number): string;
  getChainType(): ChainType;
}

export enum ChainType {
  EVM,
  BTC,
}
