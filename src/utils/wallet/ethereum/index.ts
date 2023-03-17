// Import the crypto getRandomValues shim (**BEFORE** the shims)
import 'react-native-get-random-values';

// Import the the ethers shims (**BEFORE** ethers)
import '@ethersproject/shims';

import {ethers, providers, BigNumber} from 'ethers';
import {ChainType, IWallet} from '../interface';
import {HDNode} from 'ethers/lib/utils';

const defaultPath = "m/44'/60'/0'/0/";
export class EthereumWallet implements IWallet {
  private userWallets: Array<ethers.utils.HDNode>;
  private provider: providers.JsonRpcProvider;

  constructor(mnemonic: string, rpc: string, maxAccount = 5) {
    const hdWallet = ethers.utils.HDNode.fromMnemonic(mnemonic);
    const wallets: Array<ethers.utils.HDNode> = [];
    for (let i = 1; i <= maxAccount; i++) {
      const wallet = hdWallet.derivePath(`${defaultPath}${i}`);
      wallets.push(wallet);
    }
    this.userWallets = wallets;
    this.provider = new providers.JsonRpcProvider(rpc);
  }

  async getBalance(
    accountNumber: number,
    blockTag?: number,
  ): Promise<BigNumber> {
    const balance = await this.provider.getBalance(
      await this.userWallets[accountNumber].address,
      blockTag,
    );
    return balance;
  }
  getAddress(accountNumber: number): string {
    return this.userWallets[accountNumber].address;
  }
  getPubKey(accountNumber: number): string {
    return this.userWallets[accountNumber].publicKey;
  }
  getPrivKey(accountNumber: number): string {
    return this.userWallets[accountNumber].privateKey;
  }
  sendEth(
    accountNumber: number,
    recipientAddress: string,
    amount: string,
  ): Promise<providers.TransactionReceipt> {
    const walletTemp = new ethers.Wallet(
      this.userWallets[accountNumber],
      this.provider,
    );
    return walletTemp
      .sendTransaction({
        to: recipientAddress,
        // Convert currency unit from ether to wei
        value: ethers.utils.parseEther(amount),
      })
      .then(tx => tx.wait(1));
  }
  getChainType(): ChainType {
    return ChainType.EVM;
  }
}
