# Kat Wally

Kat Wally is a mobile wallet that allows users to create new accounts and transfer assets (ETH, BTC, SOL) to other accounts. This has been tested on only android virtual device.

## Prerequisite

1. [Install](https://reactnative.dev/docs/environment-setup) react native and android studio for virtual device.
2. Clone the repo
3. Create a new android virtual device in android studio and start it.
3. In the repo root run
```sh
npm i
npm run android
npx react-native start --reset-cache
a
```
4. After pressing `a` to launch the app in avd you can create a new wallet and fund the address (the address is also logged in the console so should be easy to copy) and then make transfers.
5. Wallet ID is the id for each separate HD wallet that is created and Account ID is the account no. in the HD Wallet.

## Features

1. Supports creation of multiple HD Wallets (use wallet id to access the multiple wallets)
2. Has secure persistence on device, it persists the hd wallet in the device and encrypts it with a user provied password.
3. Supports creation of multiple accounts for a particular HD Wallet.
4. Also supports recovering HD wallet if mnemonic is provided.
5. Supports Ethereum, Solana and Bitcoin testnet transfers.

## Screenshots

1. Home Screen

![home screen](./screenshots/homescreen.png)

2. Account Page

![account screen](./screenshots/account_transfer.png)
