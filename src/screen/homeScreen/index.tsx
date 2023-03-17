import {FixedNumber} from 'ethers';
import React, {useEffect} from 'react';
import {Alert, Button, Text, TextInput, View} from 'react-native';
import {
  generateMnemonic,
  persistMnemonic,
  retrieveMnemonic,
} from '../../utils/wallet/common';
import {EthereumWallet} from '../../utils/wallet/ethereum';

function HomeScreen() {
  const [newWalletPassword, setNewWalletPassword] = React.useState('');
  const [loginWalletPassword, setLoginWalletPassword] = React.useState('');
  const [newWalletID, setNewWalletID] = React.useState('1');
  const [walletID, setWalletID] = React.useState('1');
  const [recipientAddress, setRecipientAddress] = React.useState('');
  const [amount, setAmount] = React.useState('0');
  const [txHistory, setTxHistory] = React.useState<any>([]);
  const [loader, setLoader] = React.useState(false);

  const [accountState, setAccountState] = React.useState({
    account: '0x',
    balance: '0.0 ETH',
  });

  const [wallet, setWalletInstance] = React.useState<
    undefined | EthereumWallet
  >(undefined);

  const createNewWallet = async (pass: string, id: string) => {
    if (pass === '') {
      Alert.alert('password cannot be empty');
      return;
    }
    const mnemonic = generateMnemonic();
    console.log(mnemonic);
    await persistMnemonic(pass, mnemonic, id);
    login(pass, id);
  };

  const login = async (pass: string, id: string) => {
    try {
      setLoader(true);
      const mnemonic = await retrieveMnemonic(pass, id);
      console.log(mnemonic);
      const wallet = new EthereumWallet(
        mnemonic,
        'https://goerli.infura.io/v3/b863ead591d54e77be1db79ef34797a3',
        1,
      );
      setLoader(false);
      setWalletInstance(wallet);
      console.log(wallet.getAddress(0));
    } catch (err) {
      setLoader(false);
      console.log(err);
      Alert.alert(
        'failed to login, possibly incorrect password',
        JSON.stringify(err),
      );
    }
  };

  const sendEth = async (address: string, amount: string) => {
    Alert.alert(
      'Confirm Transaction',
      `To: ${address}\nAmount: ${amount} ETH`,
      [
        {
          text: 'Confirm',
          onPress: () => {
            console.log('here');
            setLoader(true);
            wallet
              ?.sendEth(0, address, amount)
              .then(tx => {
                setTxHistory([
                  {
                    from: accountState.account,
                    to: recipientAddress,
                    amount: amount + ' ETH',
                    txHash: tx?.transactionHash,
                    gasUsed:
                      FixedNumber.from(tx?.gasUsed)
                        .divUnsafe(FixedNumber.from('1000000000000000000'))
                        .round(5)
                        .toString() + ' ETH',
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
    const address = wallet?.getAddress(0);
    const refresh = () =>
      wallet?.getBalance(0).then(bal =>
        setAccountState({
          account: address || '0x',
          balance:
            (FixedNumber.from(bal)
              .divUnsafe(FixedNumber.from('1000000000000000000'))
              .round(3)
              .toString() || '0.00') + ' ETH',
        }),
      );
    refresh();
    const interval = setInterval(refresh, 10000);
    return () => clearInterval(interval);
  }, [wallet]);

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
            defaultValue="1"
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
            defaultValue="1"
            onChangeText={text => setWalletID(text)}
          />
          <Button
            title="Login"
            onPress={() => login(loginWalletPassword, walletID)}
          />
        </View>
      </View>
    )
  ) : (
    <>
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
          <Text>Send Eth</Text>
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
              onPress={() => sendEth(recipientAddress, amount)}
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
