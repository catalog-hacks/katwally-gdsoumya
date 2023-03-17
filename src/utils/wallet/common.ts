// Import the crypto getRandomValues shim (**BEFORE** the shims)
import 'react-native-get-random-values';

// Import the the ethers shims (**BEFORE** ethers)
import '@ethersproject/shims';

import {ethers} from 'ethers';
var RNFS = require('react-native-fs');
import Aes from 'react-native-aes-crypto';
import {keccak256} from 'ethers/lib/utils';

export const generateMnemonic = (): string => {
  return ethers.utils.entropyToMnemonic(ethers.utils.randomBytes(16));
};

export const persistMnemonic = async (
  password: string,
  mnemonic: string,
  walletCount: string,
) => {
  const path = RNFS.DocumentDirectoryPath + `/wallet_${walletCount}.json`;
  const data = await encryptData(mnemonic, password);
  console.log(data);
  return RNFS.writeFile(path, JSON.stringify(data));
};

export const retrieveMnemonic = async (
  password: string,
  walletCount: string,
) => {
  const path = RNFS.DocumentDirectoryPath + `/wallet_${walletCount}.json`;
  const fileContent = await RNFS.readFile(path);
  return decryptData(JSON.parse(fileContent), password);
};

export const encryptData = (text: string, key: string) => {
  const hashedKey = keccak256(ethers.utils.formatBytes32String(key));
  console.log(hashedKey);
  return Aes.randomKey(16).then(iv => {
    return Aes.encrypt(text, hashedKey.substring(2), iv, 'aes-256-cbc').then(
      cipher => ({
        cipher,
        iv,
      }),
    );
  });
};

export const decryptData = (
  encryptedData: {cipher: any; iv: any},
  key: string,
) => {
  const hashedKey = keccak256(ethers.utils.formatBytes32String(key));
  console.log(hashedKey);
  return Aes.decrypt(
    encryptedData.cipher,
    hashedKey.substring(2),
    encryptedData.iv,
    'aes-256-cbc',
  );
};
