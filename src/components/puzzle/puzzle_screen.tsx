// tslint:disable:no-expression-statement
import React from 'react';
import { History } from 'history';
import { Text, StyleSheet } from 'react-native';
import { Button, View } from 'native-base';
import { appStyles } from '../../application/styles';
import { goToRouteWithoutParameter, Routes } from '../../application/routing';

interface PuzzleScreenProps {
    readonly history: History;
}

export class PuzzleScreen extends React.Component<PuzzleScreenProps> {
    constructor(props: PuzzleScreenProps) {
        super(props);
    }

    render(): JSX.Element {
        return (
            <View padder style={styles.wrapper}>
                <Text>Game goes here...</Text>
                <Button
                    rounded
                    style={[appStyles.button, styles.button]}
                    onPress={goToRouteWithoutParameter(Routes.Main, this.props.history)}
                >
                    <Text style={appStyles.buttonText}>Back</Text>
                </Button>
            </View>
        );
    }
}

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