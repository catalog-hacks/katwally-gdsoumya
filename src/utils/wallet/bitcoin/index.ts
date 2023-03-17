import {Connection} from '@solana/web3.js';
import {ethers, FixedNumber} from 'ethers';
import {ChainType, IWallet, TransactionData} from '../interface';
import * as bitcoin from 'bitcoinjs-lib';
import axios from 'axios';

export class BitcoinWalet implements IWallet {
  private userWallets: Array<ethers.utils.HDNode>;
  private provider: Connection | undefined;

  constructor(mnemonic: string, maxAccount = 5) {
    const hdWallet = ethers.utils.HDNode.fromMnemonic(mnemonic);
    const wallets: Array<ethers.utils.HDNode> = [];
    for (let i = 0; i <= maxAccount; i++) {
      const path = `m/44'/0'/0'/0/${i}`;
      const wallet = hdWallet.derivePath(path);
      wallets.push(wallet);
    }
    this.userWallets = wallets;
    this.provider = undefined;
  }

  async getBalance(
    accountNumber: number,
    _blockTag?: number,
  ): Promise<FixedNumber> {
    const address = bitcoin.payments.p2pkh({
      pubkey: Buffer.from(
        this.userWallets[accountNumber].publicKey.substring(2),
        'hex',
      ),
      network: bitcoin.networks.testnet,
    }).address;
    const a = await axios.get(
      `https://blockstream.info/testnet/api/address/${address}/utxo`,
    );

    const utxoList: {status: {confirmed: boolean}; value: number}[] = a.data;
    const balance = utxoList.reduce(
      (p, _u) => p + (_u.status.confirmed ? _u.value : 0),
      0,
    );
    return FixedNumber.from(balance.toString())
      .divUnsafe(FixedNumber.from('100000000'))
      .round(8);
  }

  getAddress(accountNumber: number): string {
    return (
      bitcoin.payments.p2pkh({
        pubkey: Buffer.from(
          this.userWallets[accountNumber].publicKey.substring(2),
          'hex',
        ),
        network: bitcoin.networks.testnet,
      }).address || ''
    );
  }
  getPubKey(accountNumber: number): string {
    return this.userWallets[accountNumber].publicKey.toString();
  }
  getPrivKey(accountNumber: number): string {
    return this.userWallets[accountNumber].privateKey!.toString();
  }
  getChainType(): ChainType {
    return ChainType.BTC;
  }
  sendTokens(
    _accountNumber: number,
    _recipientAddress: string,
    _amount: string,
  ): Promise<TransactionData> {
    throw new Error('Method not implemented.');
  }
}
