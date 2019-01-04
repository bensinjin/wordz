import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Button, View } from 'native-base';
import { appStyles } from '../../application/styles';

export const MainScreen = (): JSX.Element => (
    <View padder style={styles.wrapper}>
        <Text>Welcome to Wordz (without friends)</Text>
        <Button rounded style={appStyles.blueButton}>
            <Text>Let's go!</Text>
        </Button>
    </View>
);

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        alignSelf: 'center',
    },
});
