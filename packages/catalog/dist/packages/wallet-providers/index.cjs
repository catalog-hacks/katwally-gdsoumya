'use strict';

Object.defineProperty(exports, '__esModule', {value: true});

var providers = require('@ethersproject/providers');
var BigNumber = require('bignumber.js');
var ethers = require('ethers');
var web3_js = require('@solana/web3.js');
var bip39 = require('bip39');
var bs58 = require('bs58');
var ethereumjsWallet = require('ethereumjs-wallet');

function _interopDefaultLegacy(e) {
    return e && typeof e === 'object' && 'default' in e ? e : {default: e};
}

function _interopNamespace(e) {
    if (e && e.__esModule) return e;
    var n = Object.create(null);
    if (e) {
        Object.keys(e).forEach(function (k) {
            if (k !== 'default') {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(
                    n,
                    k,
                    d.get
                        ? d
                        : {
                              enumerable: true,
                              get: function () {
                                  return e[k];
                              },
                          },
                );
            }
        });
    }
    n['default'] = e;
    return Object.freeze(n);
}

var BigNumber__default = /*#__PURE__*/ _interopDefaultLegacy(BigNumber);
var bip39__namespace = /*#__PURE__*/ _interopNamespace(bip39);
var bs58__namespace = /*#__PURE__*/ _interopNamespace(bs58);

class EthereumProvider {
    constructor(rpcUrl) {
        this.provider = null;
        this.provider = new providers.JsonRpcProvider(rpcUrl);
    }
}

exports.Blockchain = void 0;
(function (Blockchain) {
    Blockchain['Bitcoin'] = 'bitcoin';
    Blockchain['Ethereum'] = 'ethereum';
    Blockchain['Solana'] = 'solana';
})(exports.Blockchain || (exports.Blockchain = {}));
exports.BlockchainNetwork = void 0;
(function (BlockchainNetwork) {
    BlockchainNetwork['Mainnet'] = 'mainnet';
    BlockchainNetwork['Testnet'] = 'testnet';
    BlockchainNetwork['Devnet'] = 'devnet';
})(exports.BlockchainNetwork || (exports.BlockchainNetwork = {}));
exports.SolanaBlockchainNetwork = void 0;
(function (SolanaBlockchainNetwork) {
    SolanaBlockchainNetwork['MainnetBeta'] = 'mainnet-beta';
    SolanaBlockchainNetwork['Testnet'] = 'testnet';
    SolanaBlockchainNetwork['Devnet'] = 'devnet';
})(exports.SolanaBlockchainNetwork || (exports.SolanaBlockchainNetwork = {}));

class EthereumWallet {
    fromMnemonic(mnemonic, pathIndex = 0) {
        try {
            const path = `m/44'/60'/0'/0/${pathIndex}`;
            const wallet = ethers.ethers.Wallet.fromMnemonic(mnemonic, path);
            const {privateKey, address, mnemonic: walletMnemonic} = wallet;
            this.privateKey = privateKey;
            this.address = address;
            this.mnemonic = walletMnemonic.phrase;
            return {
                privateKey,
                address,
                mnemonic: walletMnemonic.phrase,
            };
        } catch (error) {
            throw new Error('failed to create wallet from mnemonic');
        }
    }
    fromPrivateKey(privateKey) {
        const wallet = new ethers.ethers.Wallet(privateKey);
        const {address} = wallet;
        this.privateKey = privateKey;
        this.address = address;
        // cannot get mnemonic from pk
        return {
            privateKey,
            address,
        };
    }
    fromRandom(pathIndex = 0) {
        const path = `m/44'/60'/0'/0/${pathIndex}`;
        const wallet = ethers.ethers.Wallet.createRandom({
            path,
        });
        const {privateKey, address, mnemonic} = wallet;
        this.privateKey = privateKey;
        this.address = address;
        this.mnemonic = mnemonic.phrase;
        return {
            privateKey,
            address,
            mnemonic: mnemonic.phrase,
        };
    }
    getBalance(address) {
        return new BigNumber__default['default']('0');
    }
    constructor(network = exports.BlockchainNetwork.Testnet) {
        this.name = exports.Blockchain.Ethereum;
        this.address = '';
        this.privateKey = '';
        this.mnemonic = '';
        this._ready = false;
        this.network = network;
    }
}

const PROVIDERS = {
    [exports.SolanaBlockchainNetwork.MainnetBeta]: new web3_js.Connection(
        web3_js.clusterApiUrl('mainnet-beta'),
    ),
    [exports.SolanaBlockchainNetwork.Testnet]: new web3_js.Connection(
        web3_js.clusterApiUrl('testnet'),
    ),
    [exports.SolanaBlockchainNetwork.Devnet]: new web3_js.Connection(
        web3_js.clusterApiUrl('devnet'),
    ),
};
const SOLANA_DEFAULT_PATH = "m/44'/501'/0'/0'";

class SolanaProvider {
    constructor(network) {
        this.provider = PROVIDERS[network];
    }
}

class SolanaWallet {
    generateKeypairFromMnemonic(mnemonic, pathIndex) {
        const path = pathIndex
            ? `m/44'/501'/${pathIndex}'/0'`
            : SOLANA_DEFAULT_PATH;
        const seed = bip39__namespace.mnemonicToSeedSync(mnemonic);
        const hd = ethereumjsWallet.hdkey.fromMasterSeed(seed);
        const hdNode = hd.derivePath(path);
        const keyPair = web3_js.Keypair.fromSeed(
            hdNode.getWallet().getPrivateKey(),
        );
        return keyPair;
    }
    fromMnemonic(mnemonic, pathIndex) {
        const keyPair = this.generateKeypairFromMnemonic(mnemonic, pathIndex);
        this.address = keyPair.publicKey.toBase58();
        this.privateKey = keyPair.secretKey;
        this.mnemonic = mnemonic;
    }
    fromRandom(pathIndex) {
        const keyPair = this.generateKeypairFromMnemonic(
            this.mnemonic,
            pathIndex,
        );
        this.address = keyPair.publicKey.toBase58();
        this.privateKey = keyPair.secretKey;
    }
    fromPrivateKey(privateKey = this.privateKey) {
        const keyPair = web3_js.Keypair.fromSecretKey(privateKey);
        this.address = keyPair.publicKey.toBase58();
        this.privateKey = keyPair.secretKey;
    }
    get privateKeyAsString() {
        if (!this.privateKey) throw new Error('Wallet not initialized');
        return bs58__namespace.encode(this.privateKey);
    }
    getBalance(address) {
        const _address = new web3_js.PublicKey(address);
        return this.provider.getBalance(_address);
    }
    constructor(params) {
        this.name = exports.Blockchain.Solana;
        this.address = '';
        this.privateKey = new Uint8Array();
        this.mnemonic = bip39__namespace.generateMnemonic();
        this.network = exports.SolanaBlockchainNetwork.Devnet;
        this.network =
            (params == null ? void 0 : params.network) ||
            exports.SolanaBlockchainNetwork.Devnet;
        const {provider} = new SolanaProvider(this.network);
        this.provider = provider;
    }
}

exports.EthereumProvider = EthereumProvider;
exports.EthereumWallet = EthereumWallet;
exports.SolanaProvider = SolanaProvider;
exports.SolanaWallet = SolanaWallet;
