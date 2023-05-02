/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import './shim';

import React from 'react';
import type {PropsWithChildren} from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    useColorScheme,
    View,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import HomeScreen from './src/screen/homeScreen';

function App(): JSX.Element {
    const isDarkMode = useColorScheme() === 'dark';

    const backgroundStyle = {
        backgroundColor: Colors.lighter,
    };

    return (
        <View style={styles.bg}>
            <HomeScreen />
        </View>
    );
}

const styles = StyleSheet.create({
    bg: {
        flex: 1,
        backgroundColor: 'rgb(28, 29, 33)',
    },
    title: {
        fontSize: 25,
        fontFamily: 'monospace',
        textAlign: 'center',
        fontWeight: 'bold',
        margin: 5,
        color: 'black',
    },
    sectionContainer: {
        marginTop: 32,
        paddingHorizontal: 24,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '600',
    },
    sectionDescription: {
        marginTop: 8,
        fontSize: 18,
        fontWeight: '400',
    },
    highlight: {
        fontWeight: '700',
    },
});

export default App;
