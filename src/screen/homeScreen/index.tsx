import React from 'react';
import {Button, Text, TextInput, View} from 'react-native';
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

  const createNewWallet = async (pass: string, id: string) => {
    const mnemonic = generateMnemonic();
    console.log(mnemonic);
    await persistMnemonic(pass, mnemonic, id);
  };

  const login = async (pass: string, id: string) => {
    const mnemonic = await retrieveMnemonic(pass, id);
    console.log(mnemonic);
    const wallet = new EthereumWallet(
      mnemonic,
      'https://goerli.infura.io/v3/b863ead591d54e77be1db79ef34797a3',
      1,
    );

    console.log(wallet.getAddress(0));
  };

  return (
    <View>
      <Text>Kat Wally</Text>
      <View style={{margin:10}}>
        <Text> New Wallet </Text>
        <TextInput
          placeholder="password"
          textContentType="password"
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
      <View style={{margin:10}}>
        <Text> Login </Text>
        <TextInput
          placeholder="password"
          textContentType="password"
          onChangeText={text => setLoginWalletPassword(text)}
        />
        <TextInput defaultValue="1" onChangeText={text => setWalletID(text)} />
        <Button
          title="Login"
          onPress={() => login(loginWalletPassword, walletID)}
        />
      </View>
    </View>
  );
}

export default HomeScreen;
