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
// Populate wordsFound array with empty values based on wordsRemaining
// Render word placeholders based on words found, initially empty
// Render activeWord, initially empty
// Render puzzle, as buttons that append to activeWord when pressed
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
const letterPlaceHolderWidth = 45;
const activeWordHeight = 50;

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
            wordsFound: this.fillWordsFoundWithEmptyValues(),
        };
        this.clearActiveWord = this.clearActiveWord.bind(this);
        this.submitActiveWord = this.submitActiveWord.bind(this);
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
                <Text style={{ marginTop: 20, fontSize: 20 }}>Demo puzzle, try "doc", "sot", "doors" etc...</Text>
            </View>
        );
    }

    fillWordsFoundWithEmptyValues(): Array<string> {
        return R.map((permutation: string): string => this.buildEmptyValueStringOfLength(permutation.length), puzzle.permutations);
    }

    buildEmptyValueStringOfLength(length: number): string {
        return emptyLetterValue.repeat(length);
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
                    margin: 2,
                    width: letterPlaceHolderWidth,
                }}>
                <Text style={letter === emptyLetterValue ? { color: 'white'} : { color: 'black' }}>
                    {letter}
                </Text>
            </View>
        );
    }

    renderActiveWord(): JSX.Element {
        return (
            <View style={{ height: activeWordHeight }}>
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
                        onPress={(): void => this.appendLetterToActiveWord(letter)}
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
        if (R.not(R.includes(this.state.activeWord, puzzle.permutations))) {
            this.clearActiveWord();
            return undefined;
        }
        if (R.includes(this.state.activeWord, this.state.wordsFound)) {
            return undefined;
        }
        const targetEmptyValueString = this.buildEmptyValueStringOfLength(this.state.activeWord.length);
        const targetIndex = R.indexOf(targetEmptyValueString, this.state.wordsFound);
        this.pushActiveWordToWordsFound(targetIndex);
    }

    clearActiveWord(): void {
        this.setState({
            activeWord: '',
        });
    }

    appendLetterToActiveWord(letter: string): void {
        this.setState((state: State) => {
            if (state.activeWord && state.activeWord.length > 7) {
                return state;
            }
            return { activeWord: state.activeWord + letter };
        });
    }

    pushActiveWordToWordsFound(index: number): void {
        this.setState((state: State) => {
            return {
                wordsFound: [
                    ...R.slice(0, index, state.wordsFound),
                    state.activeWord,
                    ...R.slice(index + 1, Infinity, state.wordsFound),
                ],
            };
        });
    }
}
