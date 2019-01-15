import React from 'react';
import { History } from 'history';
import { Text } from 'react-native';
import { Button, View } from 'native-base';
import { appStyles } from '../../application/styles';
import { goToRouteWithParameter, Routes } from '../../application/routing';
import { pickPuzzleId } from '../../application/puzzle_helpers';

interface MainScreenProps {
    readonly history: History;
}

export const MainScreen = (props: MainScreenProps): JSX.Element => (
    <View padder style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Welcome</Text>
        <Button
            rounded
            style={[appStyles.button, { alignSelf: 'center', padding: 10 }]}
            onPress={goToRouteWithParameter(Routes.Puzzle, pickPuzzleId(), props.history)}
        >
            <Text style={appStyles.buttonText}>Let's go!</Text>
        </Button>
    </View>
);
