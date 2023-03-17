import {
  Keypair,
  Transaction,
  Connection,
  clusterApiUrl,
  sendAndConfirmTransaction,
  SystemProgram,
  PublicKey,
} from '@solana/web3.js';
import * as bip39 from 'bip39';
import * as bs58 from 'bs58';
import {BigNumber, FixedNumber} from 'ethers';
import {ChainType, IWallet, TransactionData} from '../interface';
import {derivePath} from 'ed25519-hd-key';

export class SolanaWallet implements IWallet {
  private userWallets: Array<Keypair>;
  private provider: Connection;

  constructor(mnemonic: string, maxAccount = 5) {
    const wallets: Array<Keypair> = [];
    console.log('here1');
    const seed = bip39.mnemonicToSeedSync(mnemonic, ''); // (mnemonic, password)
    console.log(seed.toString());
    for (let i = 0; i < maxAccount; i++) {
      const path = `m/44'/501'/${i}'/0'`;
      console.log('inside');
      const keypair = Keypair.fromSeed(
        derivePath(path, seed.toString('hex')).key,
      );
      console.log(`${path} => ${keypair.publicKey.toBase58()}`);
      wallets.push(keypair);
    }
    this.userWallets = wallets;
    this.provider = new Connection(clusterApiUrl('testnet'));
  }

  async getBalance(
    accountNumber: number,
    _blockTag?: number,
  ): Promise<FixedNumber> {
    const balance = await this.provider.getBalance(
      this.userWallets[accountNumber].publicKey,
    );
    return FixedNumber.from(balance)
      .divUnsafe(FixedNumber.from('1000000000'))
      .round(9);
  }

  getAddress(accountNumber: number): string {
    return this.userWallets[accountNumber].publicKey.toBase58();
  }
  getPubKey(accountNumber: number): string {
    return this.userWallets[accountNumber].publicKey.toString();
  }
  getPrivKey(accountNumber: number): string {
    return this.userWallets[accountNumber].secretKey.toString();
  }
  async sendTokens(
    accountNumber: number,
    recipientAddress: string,
    amount: string,
  ): Promise<TransactionData> {
    let transaction = new Transaction();
    const bytes = bs58.decode(recipientAddress);
    const recipientKey = PublicKey.decode(new Buffer(bytes));
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: this.userWallets[accountNumber].publicKey,
        toPubkey: recipientKey,
        lamports: parseInt(amount, 10) * 1_000_000_000,
      }),
    );
    const solTx = await sendAndConfirmTransaction(this.provider, transaction, [
      this.userWallets[accountNumber],
    ]);
    return {
      gasUsed: BigNumber.from('0'),
      transactionHash: solTx,
    };
  }
  getChainType(): ChainType {
    return ChainType.SOLANA;
  }
}
