import {Connection} from '@solana/web3.js';
import {BigNumber, ethers, FixedNumber} from 'ethers';
import {ChainType, IWallet, TransactionData} from '../interface';
import * as bitcoin from 'bitcoinjs-lib';
import axios from 'axios';

import CryptoAccount from 'send-crypto';

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
        const account = new CryptoAccount(
            this.userWallets[accountNumber].privateKey,
            {
                network: 'testnet',
            },
        );
        const balance = await account.getBalance('BTC');
        // const address = bitcoin.payments.p2pkh({
        //     pubkey: Buffer.from(
        //         this.userWallets[accountNumber].publicKey.substring(2),
        //         'hex',
        //     ),
        //     network: bitcoin.networks.testnet,
        // }).address;
        // const a = await axios.get(
        //     `https://blockstream.info/testnet/api/address/${address}/utxo`,
        // );

        // const utxoList: {status: {confirmed: boolean}; value: number}[] =
        //     a.data;
        // const balance = utxoList.reduce(
        //     (p, _u) => p + (_u.status.confirmed ? _u.value : 0),
        //     0,
        // );
        // already in decimals
        return FixedNumber.from(balance.toString());
    }

    async getAddress(accountNumber: number): Promise<string> {
        const account = new CryptoAccount(
            this.userWallets[accountNumber].privateKey,
            {
                network: 'testnet',
            },
        );
        const address = await account.address('BTC');
        return address;
    }
    // return (
    //     bitcoin.payments.p2pkh({
    //         pubkey: Buffer.from(
    //             this.userWallets[accountNumber].publicKey.substring(2),
    //             'hex',
    //         ),
    //         network: bitcoin.networks.testnet,
    //     }).address || ''
    // );
    // }
    getPubKey(accountNumber: number): string {
        return this.userWallets[accountNumber].publicKey.toString();
    }
    getPrivKey(accountNumber: number): string {
        return this.userWallets[accountNumber].privateKey!.toString();
    }
    getChainType(): ChainType {
        return ChainType.BTC;
    }
    async sendTokens(
        accountNumber: number,
        recipientAddress: string,
        amount: string,
    ): Promise<TransactionData> {
        const account = new CryptoAccount(
            this.userWallets[accountNumber].privateKey,
            {
                network: 'testnet',
            },
        );
        const res = await account
            .send(recipientAddress, amount, 'BTC')
            .on('transactionHash', console.log)
            .on('confirmation', console.log);
        return {transactionHash: res, gasUsed: BigNumber.from('0')};
    }
}
