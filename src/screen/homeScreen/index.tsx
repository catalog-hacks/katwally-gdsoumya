import {FixedNumber} from 'ethers';
import React, {useEffect} from 'react';
import {Alert, Button, Text, TextInput, View} from 'react-native';
import {CachesDirectoryPath} from 'react-native-fs';
import {BitcoinWalet} from '../../utils/wallet/bitcoin';
import {
  generateMnemonic,
  persistMnemonic,
  retrieveMnemonic,
} from '../../utils/wallet/common';
import {EthereumWallet} from '../../utils/wallet/ethereum';
import {ChainType, IWallet} from '../../utils/wallet/interface';
import {SolanaWallet} from '../../utils/wallet/solana';

function HomeScreen() {
  const [newWalletPassword, setNewWalletPassword] = React.useState('');
  const [loginWalletPassword, setLoginWalletPassword] = React.useState('');
  const [newWalletID, setNewWalletID] = React.useState('1');
  const [newWalletHDID, setNewWalletHDID] = React.useState('1');
  const [walletID, setWalletID] = React.useState('1');
  const [chain, setChain] = React.useState(ChainType.EVM);
  const [recipientAddress, setRecipientAddress] = React.useState('');
  const [amount, setAmount] = React.useState('0');
  const [txHistory, setTxHistory] = React.useState<any>([]);
  const [loader, setLoader] = React.useState(false);

  const [accountState, setAccountState] = React.useState({
    account: '0x',
    balance: '0.0',
  });

  const [wallet, setWalletInstance] = React.useState<undefined | IWallet>(
    undefined,
  );

  const createNewWallet = async (pass: string, id: string) => {
    if (pass === '') {
      Alert.alert('password cannot be empty');
      return;
    }
    const mnemonic = generateMnemonic();
    console.log(mnemonic);
    await persistMnemonic(pass, mnemonic, id);
    Alert.alert('Walet Created!', 'Please login to conitnue');
  };

  const login = async (pass: string, id: string, chain: ChainType) => {
    try {
      setLoader(true);
      const mnemonic = await retrieveMnemonic(pass, id);
      console.log(mnemonic);

      if (chain === ChainType.EVM) {
        let wallet = new EthereumWallet(
          mnemonic,
          'https://goerli.infura.io/v3/b863ead591d54e77be1db79ef34797a3',
          parseInt(newWalletHDID, 10),
        );
        console.log(wallet.getAddress(parseInt(newWalletHDID, 10) - 1));
        setWalletInstance(wallet);
      } else if (chain === ChainType.SOLANA) {
        let wallet: IWallet = new SolanaWallet(
          mnemonic,
          parseInt(newWalletHDID, 10),
        );
        console.log(wallet.getAddress(parseInt(newWalletHDID, 10) - 1));
        setWalletInstance(wallet);
      } else if (chain === ChainType.BTC) {
        let wallet: IWallet = new BitcoinWalet(
          mnemonic,
          parseInt(newWalletHDID, 10),
        );
        console.log(wallet.getAddress(parseInt(newWalletHDID, 10) - 1));
        setWalletInstance(wallet);
      }
      setLoader(false);
    } catch (err) {
      setLoader(false);
      console.log(err);
      Alert.alert(
        'failed to login, possibly incorrect password',
        JSON.stringify(err),
      );
    }
  };

  const sendTokens = async (address: string, amount: string) => {
    Alert.alert(
      'Confirm Transaction',
      `To: ${address}\nAmount: ${amount} ${chain.toString()}`,
      [
        {
          text: 'Confirm',
          onPress: () => {
            console.log('here');
            setLoader(true);
            wallet
              ?.sendTokens(parseInt(newWalletHDID, 10) - 1, address, amount)
              .then(tx => {
                setTxHistory([
                  {
                    from: accountState.account,
                    to: recipientAddress,
                    amount: amount + ` ${chain.toString()}`,
                    txHash: tx?.transactionHash,
                    gasUsed:
                      FixedNumber.from(tx?.gasUsed)
                        .divUnsafe(FixedNumber.from('1000000000000000000'))
                        .round(5)
                        .toString() + ` ${chain.toString()}`,
                  },
                  ...txHistory,
                ]);
                setLoader(false);
              })
              .catch(err => {
                console.log(err);
                setLoader(false);
                Alert.alert(
                  'failed to make the transaction:',
                  (err as Error).message,
                );
              });
          },
        },
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
      ],
      {cancelable: false},
    );
  };

  useEffect(() => {
    const address = wallet?.getAddress(parseInt(newWalletHDID, 10) - 1);
    const refresh = () =>
      wallet?.getBalance(parseInt(newWalletHDID, 10) - 1).then(bal =>
        setAccountState({
          account: address || '0x',
          balance: (bal.toString() || '0.00') + ` ${chain.toString()}`,
        }),
      );
    refresh();
    const interval = setInterval(refresh, 10000);
    return () => clearInterval(interval);
  }, [chain, newWalletHDID, wallet]);

  return wallet === undefined ? (
    loader ? (
      <View>
        <Text style={{margin: 30}}>....Loggin in....</Text>
      </View>
    ) : (
      <View>
        <Text>Kat Wally</Text>
        <View style={{margin: 10}}>
          <Text> New Wallet </Text>
          <TextInput
            placeholder="password"
            textContentType="password"
            secureTextEntry={true}
            onChangeText={text => setNewWalletPassword(text)}
          />
          <TextInput
            defaultValue={newWalletID}
            onChangeText={text => setNewWalletID(text)}
          />
          <Button
            title="NEW"
            onPress={() => createNewWallet(newWalletPassword, newWalletID)}
          />
        </View>
        <View style={{margin: 10}}>
          <Text> Login </Text>
          <TextInput
            placeholder="password"
            textContentType="password"
            secureTextEntry={true}
            onChangeText={text => setLoginWalletPassword(text)}
          />
          <TextInput
            defaultValue={chain.toString()}
            onChangeText={text => {
              if (text == 'SOL') {
                setChain(ChainType.SOLANA);
              } else if (text == 'ETH') {
                setChain(ChainType.EVM);
              } else if (text == 'BTC') {
                setChain(ChainType.BTC);
              }
            }}
          />
          <TextInput
            defaultValue={walletID}
            onChangeText={text => setWalletID(text)}
          />
          <TextInput
            defaultValue={newWalletHDID}
            onChangeText={text => {
              if (text === '') {
                return;
              }
              if (parseInt(text, 10) < 10) {
                setNewWalletHDID(text);
              } else {
                Alert.alert(
                  'Warning',
                  'Cannot have more than 10 derived accounts',
                );
              }
            }}
          />
          <Button
            title="Login"
            onPress={() => login(loginWalletPassword, walletID, chain)}
          />
        </View>
      </View>
    )
  ) : (
    <>
      <Button
        title="Back"
        onPress={() => {
          setWalletInstance(undefined);
        }}
      />
      <View>
        <Text>Your Account</Text>
        <Text>Address : {accountState.account}</Text>
        <Text>Balance : {accountState.balance}</Text>
      </View>
      {loader ? (
        <View>
          <Text style={{margin: 30}}>....Sending Transaction....</Text>
        </View>
      ) : (
        <View>
          <Text>Send {chain.toString()}</Text>
          <View>
            <TextInput
              placeholder="recipient address"
              onChangeText={text => setRecipientAddress(text)}
            />
            <TextInput
              placeholder="amount"
              keyboardType="numeric"
              onChangeText={text => setAmount(text)}
            />
            <Button
              title="Send"
              onPress={() => sendTokens(recipientAddress, amount)}
            />
          </View>
          <View>
            {txHistory.map((data, key) => (
              <View key={key} style={{margin: 20}}>
                <Text>Tx : {txHistory.length - key}</Text>
                <Text>To : {data.to}</Text>
                <Text>Amount : {data.amount}</Text>
                <Text>Fees : {data.gasUsed}</Text>
                <Text>Hash : {data.txHash}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </>
  );
}

export default HomeScreen;
