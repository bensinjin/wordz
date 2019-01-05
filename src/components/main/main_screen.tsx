import React from 'react';
import { History } from 'history';
import { Text } from 'react-native';
import { Button, View } from 'native-base';
import { appStyles } from '../../application/styles';
import { goToRouteWithoutParameter, Routes } from '../../application/routing';

interface MainScreenProps {
    readonly history: History;
}

export const MainScreen = (props: MainScreenProps): JSX.Element => (
    <View padder style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Welcome  (whout friends)</Text>
        <Button
            rounded
            style={[appStyles.button, { alignSelf: 'center', padding: 10 }]}
            onPress={goToRouteWithoutParameter(Routes.Puzzle, props.history)}
        >
            <Text style={appStyles.buttonText}>Let's go!</Text>
        </Button>
    </View>
);
