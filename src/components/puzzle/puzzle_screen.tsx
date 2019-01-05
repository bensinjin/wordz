// tslint:disable:no-expression-statement readonly-keyword readonly-array
import React from 'react';
import * as R from 'ramda';
import { History } from 'history';
import { Text, View, TouchableOpacity } from 'react-native';
import { Button } from 'native-base';
import { appStyles } from '../../application/styles';
import { goToRouteWithoutParameter, Routes } from '../../application/routing';

interface PuzzleScreenProps {
    readonly history: History;
}

// Game Algorithm:
// Populate wordsRemaining array
// Populate wordsFound array with "empty" values
// Render wordsFound array on screen
// As letters are pressed append them to activeWord
// If "enter" pressed and activeWord in wordsRemaining:
//      - clear activeWord
//      - push activeWord into wordsFound array
//      - remove activeWord from wordsRemaining array
//      - score
//      - check if puzzle complete
// If "enter" pressed and activeWord not in wordsRemaining:
//      - clear activeWord
// If "clear" pressed
//      - clear activeWord
// If timer expired && puzzle.word in wordsRemaining : end level :  next level

// A dummy puzzle for us to test with
const puzzle = {
    puzzle: 'ocdtors',
    permutations: [
        'doc',
        'sot',
        'sort',
        'doors',
        'doctors',
    ],
};

const emptyLetterValue = '*';

interface State {
    activeWord: string;
    wordsRemaining: Array<string>;
    wordsFound: Array<string>;
}

export class PuzzleScreen extends React.Component<PuzzleScreenProps, State> {

    constructor(props: PuzzleScreenProps) {
        super(props);
        this.state = {
            activeWord: '',
            wordsRemaining: puzzle.permutations,
            wordsFound: this.fillWordsFoundWithEmptyValue(),
        };
        this.clearActiveWord = this.clearActiveWord.bind(this);
    }

    render(): JSX.Element {
        return (
            <View
                style={{
                    flex: 1,
                    padding: 20,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <View style={{ marginBottom: 30 }}>
                    {this.renderWordPlaceholders()}
                </View>
                <View style={{ marginBottom: 30 }}>
                    {this.renderActiveWord()}
                    {this.renderButtonsForLetters()}
                </View>
                <View>
                    {this.renderHUDButtons()}
                </View>
            </View>
        );
    }

    fillWordsFoundWithEmptyValue(): Array<string> {
        return R.map((permutation: string): string => emptyLetterValue.repeat(permutation.length), puzzle.permutations);
    }

    renderWordPlaceholders(): JSX.Element {
        return (
            <View>
                {this.state.wordsFound.map(
                    (word: string, index: number) =>
                        <View key={index}>{this.renderWordPlaceholderRow(word)}</View>,
                )}
            </View>
        );
    }

    renderWordPlaceholderRow(word: string): JSX.Element {
        const letters = word.split('');
        return (
            <View style={{ flexDirection: 'row' }}>
                {letters.map(
                    (letter: string, index: number) =>
                        <View key={index}>{this.renderWordPlaceholderRowLetter(letter)}</View>,
                )}
            </View>
        );
    }

    renderWordPlaceholderRowLetter(letter: string): JSX.Element {
        return (
            <View
                style={{
                    borderColor: 'grey',
                    borderWidth: 1,
                    borderRadius: 5,
                    padding: 15,
                    margin: 5,
                }}>
                <Text style={letter === emptyLetterValue ? { color: 'white'} : { color: 'black' }}>
                    {letter}
                </Text>
            </View>
        );
    }

    renderActiveWord(): JSX.Element {
        return (
            <View style={{ height: 50 }}>
                <Text style={{ fontSize: 30, textAlign: 'center' }}>{this.state.activeWord}</Text>
            </View>
        );
    }

    renderButtonsForLetters(): JSX.Element {
        const letters = puzzle.puzzle.split('');
        return(
            <View style={{ flexDirection: 'row' }}>
                {letters.map((letter: string, index: number) =>
                    <TouchableOpacity
                        style={{
                            borderColor: 'grey',
                            borderWidth: 1,
                            padding: 15,
                            marginHorizontal: 3,
                            borderRadius: 5,
                        }}
                        key={index}
                        onPress={(): void => this.appendToActiveWord(letter)}
                    >
                        <Text>{letter}</Text>
                    </TouchableOpacity>)
                }
            </View>
        );
    }

    renderHUDButtons(): JSX.Element {
        return (
            <View style={{ flexDirection: 'row' }}>
                {this.renderSingleHudButton('Submit', this.submitActiveWord)}
                {this.renderSingleHudButton('Clear', this.clearActiveWord)}
                {this.renderSingleHudButton('Exit', goToRouteWithoutParameter(Routes.Main, this.props.history))}
            </View>
        );
    }

    renderSingleHudButton(text: string, onPress: () => void): JSX.Element {
        return (
            <Button
                rounded
                style={[appStyles.button, { padding: 10, marginHorizontal: 5 }]}
                onPress={onPress}
            >
                <Text style={appStyles.buttonText}>{text}</Text>
            </Button>
        );
    }

    submitActiveWord(): void {
        // TODO
    }

    clearActiveWord(): void {
        this.setState({
            activeWord: '',
        });
    }

    appendToActiveWord(letter: string): void {
        this.setState((state: State) => {
            if (state.activeWord && state.activeWord.length > 7) {
                return state;
            }
            return { activeWord: state.activeWord + letter };
        });
    }
}
