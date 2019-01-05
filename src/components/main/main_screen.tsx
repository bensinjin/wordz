import React from 'react';
import { History } from 'history';
import { Text, StyleSheet } from 'react-native';
import { Button, View } from 'native-base';
import { appStyles } from '../../application/styles';
import { goToRouteWithoutParameter, Routes } from '../../application/routing';

interface MainScreenProps {
    readonly history: History;
}

export const MainScreen = (props: MainScreenProps): JSX.Element => (
    <View padder style={styles.wrapper}>
        <Text>Welcome to Wordz (without friends)</Text>
        <Button
            rounded
            style={[appStyles.button, styles.button]}
            onPress={goToRouteWithoutParameter(Routes.Puzzle, props.history)}
        >
            <Text style={appStyles.buttonText}>Let's go!</Text>
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
        padding: 10,
    },
});
