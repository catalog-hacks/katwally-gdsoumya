/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {useState} from 'react';
import {Button, ScrollView, Text, View} from 'react-native';
import NewAccount from '../newAccount';
import AccountScreen from '../accountScreen';

function HomeScreen() {
    const [accountIndex, setaccountIndex] = useState(0);
    const [ethereumWallets, setEthereumWallets] = useState([]);
    const [solanaWallets, setSolanaWallets] = useState([]);

    return ethereumWallets.length === 0 || solanaWallets.length === 0 ? (
        <NewAccount
            accountIndex={accountIndex}
            setEthereumWallets={setEthereumWallets}
            setSolanaWallets={setSolanaWallets}
        />
    ) : (
        <AccountScreen />
    );
}

export default HomeScreen;
