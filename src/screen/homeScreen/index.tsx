/* eslint-disable react-native/no-inline-styles */
import {FixedNumber} from 'ethers';
import {mnemonicToEntropy} from 'ethers/lib/utils';
import React, {useEffect} from 'react';
import {Alert, Button, StyleSheet, Text, TextInput, View} from 'react-native';
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
    const [recoveredMnemonic, setRecoveredMnemonic] = React.useState('');
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

    const recoverWallet = async (
        mnemonic: string,
        pass: string,
        id: string,
    ) => {
        if (pass === '') {
            Alert.alert('password cannot be empty');
            return;
        }
        if (mnemonic === '') {
            Alert.alert('mnemonic cannot be empty');
            return;
        }
        try {
            mnemonicToEntropy(mnemonic);
        } catch (err) {
            Alert.alert('Mnemonic invalid', (err as Error).message);
            return;
        }
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
                console.log(
                    await wallet.getAddress(parseInt(newWalletHDID, 10) - 1),
                );
                setWalletInstance(wallet);
            } else if (chain === ChainType.SOLANA) {
                let wallet: IWallet = new SolanaWallet(
                    mnemonic,
                    parseInt(newWalletHDID, 10),
                );
                console.log(
                    await wallet.getAddress(parseInt(newWalletHDID, 10) - 1),
                );
                setWalletInstance(wallet);
            } else if (chain === ChainType.BTC) {
                let wallet: IWallet = new BitcoinWalet(
                    mnemonic,
                    parseInt(newWalletHDID, 10),
                );
                console.log(
                    await wallet.getAddress(parseInt(newWalletHDID, 10) - 1),
                );
                setWalletInstance(wallet);
            }
            setLoader(false);
        } catch (err) {
            setLoader(false);
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
                        setLoader(true);
                        wallet
                            ?.sendTokens(
                                parseInt(newWalletHDID, 10) - 1,
                                address,
                                amount,
                            )
                            .then(tx => {
                                setTxHistory([
                                    {
                                        from: accountState.account,
                                        to: recipientAddress,
                                        amount: amount + ` ${chain.toString()}`,
                                        txHash: tx?.transactionHash,
                                        gasUsed:
                                            FixedNumber.from(tx?.gasUsed)
                                                .divUnsafe(
                                                    FixedNumber.from(
                                                        '1000000000000000000',
                                                    ),
                                                )
                                                .round(5)
                                                .toString() +
                                            ` ${chain.toString()}`,
                                    },
                                    ...txHistory,
                                ]);
                                setLoader(false);
                            })
                            .catch(err => {
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
        const refresh = () =>
            wallet?.getAddress(parseInt(newWalletHDID, 10) - 1).then(address =>
                wallet?.getBalance(parseInt(newWalletHDID, 10) - 1).then(bal =>
                    setAccountState({
                        account: address || '0x',
                        balance:
                            (bal.toString() || '0.00') + ` ${chain.toString()}`,
                    }),
                ),
            );
        refresh();
        const interval = setInterval(refresh, 10000);
        return () => clearInterval(interval);
    }, [chain, newWalletHDID, wallet]);

    return wallet === undefined ? (
        loader ? (
            <View>
                <Text style={styles.loader}>....Logging in....</Text>
            </View>
        ) : (
            <View>
                <View style={{margin: 10}}>
                    <Text style={styles.sections}> Recover Wallet </Text>
                    <View style={{flexDirection: 'row'}}>
                        <View style={styles.labelWrap}>
                            <Text style={styles.otherText}>
                                {' '}
                                Wallet Password{' '}
                            </Text>
                        </View>
                        <TextInput
                            style={styles.inputs}
                            placeholder="password"
                            textContentType="password"
                            secureTextEntry={true}
                            defaultValue={newWalletPassword}
                            onChangeText={text => setNewWalletPassword(text)}
                        />
                    </View>
                    <View style={{flexDirection: 'row'}}>
                        <View style={styles.labelWrap}>
                            <Text style={styles.otherText}>
                                {' '}
                                New Wallet ID{' '}
                            </Text>
                        </View>
                        <TextInput
                            style={styles.inputs}
                            defaultValue={newWalletID}
                            onChangeText={text => setNewWalletID(text)}
                        />
                    </View>
                    <View style={{flexDirection: 'row'}}>
                        <View style={styles.labelWrap}>
                            <Text style={styles.otherText}> Mnemonic </Text>
                        </View>
                        <TextInput
                            style={styles.inputs}
                            placeholder="enter mnemonic"
                            defaultValue={recoveredMnemonic}
                            onChangeText={text => setRecoveredMnemonic(text)}
                        />
                    </View>
                    <Button
                        title="RECOVER"
                        onPress={() =>
                            recoverWallet(
                                recoveredMnemonic,
                                newWalletPassword,
                                newWalletID,
                            )
                        }
                    />
                </View>
                <View style={{margin: 10}}>
                    <Text style={styles.sections}> New Wallet </Text>
                    <View style={{flexDirection: 'row'}}>
                        <View style={styles.labelWrap}>
                            <Text style={styles.otherText}>
                                {' '}
                                Wallet Password{' '}
                            </Text>
                        </View>
                        <TextInput
                            style={styles.inputs}
                            placeholder="password"
                            textContentType="password"
                            secureTextEntry={true}
                            defaultValue={newWalletPassword}
                            onChangeText={text => setNewWalletPassword(text)}
                        />
                    </View>
                    <View style={{flexDirection: 'row'}}>
                        <View style={styles.labelWrap}>
                            <Text style={styles.otherText}>
                                {' '}
                                New Wallet ID{' '}
                            </Text>
                        </View>
                        <TextInput
                            style={styles.inputs}
                            defaultValue={newWalletID}
                            onChangeText={text => setNewWalletID(text)}
                        />
                    </View>
                    <Button
                        title="NEW"
                        onPress={() =>
                            createNewWallet(newWalletPassword, newWalletID)
                        }
                    />
                </View>
                <View style={{margin: 10}}>
                    <Text style={styles.sections}> Login </Text>
                    <View style={{flexDirection: 'row'}}>
                        <View style={styles.labelWrap}>
                            <Text style={styles.otherText}>
                                {' '}
                                Wallet Password{' '}
                            </Text>
                        </View>
                        <TextInput
                            style={styles.inputs}
                            placeholder="password"
                            textContentType="password"
                            secureTextEntry={true}
                            defaultValue={loginWalletPassword}
                            onChangeText={text => setLoginWalletPassword(text)}
                        />
                    </View>
                    <View style={{flexDirection: 'row'}}>
                        <View style={styles.labelWrap}>
                            <Text style={styles.otherText}>
                                {' '}
                                Account Chain (ETH, SOL, BTC)
                            </Text>
                        </View>
                        <TextInput
                            style={styles.inputs}
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
                    </View>
                    <View style={{flexDirection: 'row'}}>
                        <View style={styles.labelWrap}>
                            <Text style={styles.otherText}> Wallet ID </Text>
                        </View>
                        <TextInput
                            style={styles.inputs}
                            defaultValue={walletID}
                            onChangeText={text => setWalletID(text)}
                        />
                    </View>
                    <View style={{flexDirection: 'row'}}>
                        <View style={styles.labelWrap}>
                            <Text style={styles.otherText}> Account ID </Text>
                        </View>
                        <TextInput
                            style={styles.inputs}
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
                    </View>
                    <Button
                        title="Login"
                        onPress={() =>
                            login(loginWalletPassword, walletID, chain)
                        }
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
            <View style={{margin: 10}}>
                <Text style={styles.sections}>Your Account</Text>
                <Text style={styles.otherText}>
                    Address : {accountState.account}
                </Text>
                <Text style={styles.otherText}>
                    Balance : {accountState.balance}
                </Text>
            </View>
            {loader ? (
                <View>
                    <Text style={styles.loader}>
                        ....Sending Transaction....
                    </Text>
                </View>
            ) : (
                <View>
                    <View style={{margin: 10}}>
                        <Text style={styles.sections}>
                            Send {chain.toString()}
                        </Text>
                        <View style={{flexDirection: 'row'}}>
                            <View style={styles.labelWrap}>
                                <Text style={styles.otherText}>To Address</Text>
                            </View>
                            <TextInput
                                style={styles.inputs}
                                placeholder="recipient address"
                                onChangeText={text => setRecipientAddress(text)}
                            />
                        </View>
                        <View style={{flexDirection: 'row'}}>
                            <View style={styles.labelWrap}>
                                <Text style={styles.otherText}> Amount</Text>
                            </View>
                            <TextInput
                                style={styles.inputs}
                                placeholder="amount"
                                keyboardType="numeric"
                                onChangeText={text => setAmount(text)}
                            />
                        </View>
                    </View>
                    <Button
                        title="Send"
                        onPress={() => sendTokens(recipientAddress, amount)}
                    />
                    <View style={{margin: 10}}>
                        {txHistory.map((data, key) => (
                            <View key={key} style={{margin: 10}}>
                                <Text style={styles.otherText}>
                                    Tx : {txHistory.length - key}
                                </Text>
                                <Text style={styles.otherText}>
                                    To : {data.to}
                                </Text>
                                <Text style={styles.otherText}>
                                    Amount : {data.amount}
                                </Text>
                                <Text style={styles.otherText}>
                                    Fees : {data.gasUsed}
                                </Text>
                                <Text style={styles.otherText}>
                                    Hash : {data.txHash}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}
        </>
    );
}

export default HomeScreen;

const styles = StyleSheet.create({
    loader: {
        margin: 30,
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 20,
        color: 'black',
    },
    sections: {
        fontSize: 20,
        color: 'black',
        fontWeight: 'bold',
        marginBottom: 5,
    },
    labelWrap: {
        flex: 0.4,
        paddingTop: 15,
    },
    otherText: {
        color: 'black',
        fontSize: 15,
        fontWeight: '500',
    },
    inputs: {
        flex: 1,
        fontWeight: 'bold',
        marginTop: 5,
        marginBottom: 5,
        padding: 15,
        borderColor: 'black',
        borderWidth: 5,
        borderRadius: 10,
    },
});
