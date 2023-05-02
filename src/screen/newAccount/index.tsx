/* eslint-disable react/react-in-jsx-scope */
import React, {useState} from 'react';
import {Button, StyleSheet, Text, View} from 'react-native';
// import {
//     EthereumWallet,
//     SolanaWallet,
// } from '../../../packages/catalog/dist/packages/wallet-providers';
import {Picker} from '@react-native-picker/picker';

function NewAccount(props) {
    const [chain, setChain] = useState('Eth');

    const handelSubmit = () => {
        if (chain === 'Eth') {
            newEthereumWallet();
        } else {
            newSolanaWallet();
        }
    };
    const newEthereumWallet = () => {
        console.log(props);
        props.setEthereumWallet((ethwallets: any[]) => {
            ethwallets.push(0);
            return ethwallets;
        });
        console.log('eth wallet created');
        // const newEthWallet = new EthereumWallet();
        // newEthWallet.fromRandom(props.accountIndex);
        // console.log(newEthWallet.mnemonic);
        // console.log(newEthWallet.privateKey);
        // props.setEthereumWallet((ethwallets: any[]) => {
        //     ethwallets.push(newEthWallet);
        //     return ethwallets;
        // });
    };
    const newSolanaWallet = () => {
        console.log('sol wallet created');
        // const newSolWallet = new SolanaWallet();
        // newSolWallet.fromRandom(props.accountIndex);
        // props.setSolanaWallet((solwallets: any[]) => {
        //     solwallets.push(newSolWallet);
        //     return solwallets;
        // });
    };

    return (
        <View style={styles.spacing}>
            <Text style={styles.formLabel}> Create A New Account </Text>
            <View>
                <Picker
                    style={styles.inputStyle}
                    selectedValue={chain}
                    onValueChange={currChain => setChain(currChain)}>
                    <Picker.Item label="Ethereum" value="Eth" />
                    <Picker.Item label="Solana" value="Sol" />
                </Picker>
            </View>
            <View>
                <Button title="Create" onPress={handelSubmit} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    spacing: {
        marginVertical: '50%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(44 ,201, 149, 100)',
        height: '70%',
    },

    formLabel: {
        fontSize: 20,
        color: '#000',
    },
    inputStyle: {
        margin: 50,
        width: 150,
        backgroundColor: '#b9e4c9',
        color: '#000',
    },
    formText: {
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: 20,
    },
    text: {
        color: '#fff',
        fontSize: 20,
    },
});

export default NewAccount;
