// tslint:disable:no-expression-statement readonly-keyword readonly-array
import React from 'react';
import * as R from 'ramda';
import { History } from 'history';
import { Text, View, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Button } from 'native-base';
import { appStyles } from '../../application/styles';
import { goToRouteWithoutParameter, Routes } from '../../application/routing';
import { puzzles, Puzzle } from '../../puzzles/words_abridged_puzzles';

// TODO Move these to their appropriate places ...
const emptyLetterValue = '*';
const letterPlaceHolderWidth = 40;
const activeWordHeight = 50;
const millisForPuzzle = 60 * 1000;
const whiteColor = 'white';
const greyColor = 'darkgrey';
const blackColor = 'black';
const orangeColor = 'orange';
const greenColor = 'green';
const redColor = 'red';
const borderWidthForBoxes = 1;
const borderRadiusForBoxes = 10;

enum ActiveWordState {
    Valid,
    Invalid,
    Found,
}

interface PuzzleScreenProps {
    readonly history: History;
}

interface State {
    activeWord: string;
    wordsRemaining: Array<string>;
    wordsFound: Array<string>;
    secondsRemaining: number;
}

const pickPuzzle = (): Puzzle => {
    // TODO fix this - this is just for testing, don't hardcode range.
    const numberBetweenOneAndFortyNine = Math.floor(Math.random() * 39) + 1;
    return puzzles[numberBetweenOneAndFortyNine];
};

export class PuzzleScreen extends React.Component<PuzzleScreenProps, State> {
    puzzle: Puzzle;
    solution: string;
    timeoutId: number = 0;
    intervalId: number = 0;

    constructor(props: PuzzleScreenProps) {
        super(props);
        this.puzzle = pickPuzzle();
        this.solution = this.puzzle.permutations[0];
        this.state = {
            activeWord: '',
            wordsRemaining: [...this.puzzle.permutations],
            wordsFound: this.fillWordsFoundWithEmptyValues(),
            secondsRemaining: 60,
        };
        this.endPuzzleTimeElapsed = this.endPuzzleTimeElapsed.bind(this);
        this.removeSecondFromTimer = this.removeSecondFromTimer.bind(this);
        this.clearActiveWord = this.clearActiveWord.bind(this);
        this.submitActiveWord = this.submitActiveWord.bind(this);
    }

    componentDidMount(): void {
        this.timeoutId = setTimeout(this.endPuzzleTimeElapsed, millisForPuzzle);
        this.intervalId = setInterval(this.removeSecondFromTimer, 1000);
    }

    componentWillUnmount(): void {
        this.clearTimers();
    }

    render(): JSX.Element {
        if (this.puzzleFinishedEarly()) {
            this.showPuzzleSuccess();
        }
        return (
            <View
                style={{
                    flex: 1,
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: 20,
                }}
            >
                <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                    {/* TODO Lazy AF, fix this to not set hardcoded widths (flexbox), and reduce redudency*/}
                    {/* Do like hud buttons */}
                    {this.renderTimer()}
                </View>
                <View style={{ marginBottom: 30 }}>
                    {this.renderWordPlaceholders()}
                </View>
                <View style={{ marginBottom: 30 }}>
                    {this.renderActiveWord()}
                    {this.renderButtonsForLetters()}
                </View>
                <View style={{ marginBottom: 30 }}>
                    {this.renderHUDButtons()}
                </View>
                <View style={{ alignSelf: 'stretch' }}>
                    {this.renderProgress()}
                </View>
            </View>
        );
    }

    private removeSecondFromTimer(): void {
        this.setState((state: State) => {
            return { secondsRemaining: state.secondsRemaining - 1 };
        });
    }

    private fillWordsFoundWithEmptyValues(): Array<string> {
        return R.map((word: string): string =>
            this.buildEmptyValueStringOfLength(word.length), this.puzzle.permutations);
    }

    private buildEmptyValueStringOfLength(length: number): string {
        return emptyLetterValue.repeat(length);
    }

    private renderProgress(): JSX.Element {
        const total = this.puzzle.permutations.length;
        const notFound = this.state.wordsRemaining.length;
        const percentage = Math.round((total - notFound) / total * 100);
        return (
            <View style={{ borderRadius: 20, borderWidth: 2, borderColor: greenColor }}>
                <View style={{
                    borderRadius: 20,
                    backgroundColor: greenColor,
                    width: `${percentage}%`,
                    height: 8,
                }}
                />
            </View>
        );
    }

    private renderTimer(): JSX.Element {
        return (
            <View style={{ width: 100 }}>
                <Text style={{ fontSize: 30, textAlign: 'center' }}>{this.state.secondsRemaining}</Text>
            </View>
        );
    }

    private renderWordPlaceholders(): JSX.Element {
        return (
            // TODO this shouldn't be hardcoded, use screen height
            <View style={{ maxHeight: 350 }}>
                <ScrollView>
                    {this.state.wordsFound.map(
                        (word: string, index: number) =>
                            <View key={index}>{this.renderWordPlaceholderRow(word)}</View>,
                    )}
                </ScrollView>
            </View>
        );
    }

    private renderWordPlaceholderRow(word: string): JSX.Element {
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

    private renderWordPlaceholderRowLetter(letter: string): JSX.Element {
        return (
            <View
                style={{
                    color: greyColor,
                    borderWidth: borderWidthForBoxes,
                    borderRadius: borderRadiusForBoxes,
                    padding: 10,
                    margin: 3,
                    width: letterPlaceHolderWidth,
                }}
            >
                <Text style={letter === emptyLetterValue ? { color: whiteColor } : { color: blackColor }}>
                    {letter}
                </Text>
            </View>
        );
    }

    private renderActiveWord(): JSX.Element {
        const color = this.getColorForActiveWordState(this.getActiveWordState());
        return (
            <View style={{ height: activeWordHeight }}>
                <Text style={{ fontSize: 30, textAlign: 'center', color: color }}>
                    {this.state.activeWord}
                </Text>
            </View>
        );
    }

    private getActiveWordState(): ActiveWordState {
        const wordFound = R.includes(this.state.activeWord, this.state.wordsFound);
        const wordValid = R.includes(this.state.activeWord, this.puzzle.permutations);
        return wordFound ? ActiveWordState.Found : wordValid ? ActiveWordState.Valid : ActiveWordState.Invalid;
    }

    private getColorForActiveWordState(state: ActiveWordState): string {
        return state === ActiveWordState.Found ? redColor : state === ActiveWordState.Valid ? greenColor : orangeColor;
    }

    private renderButtonsForLetters(): JSX.Element {
        const letters = this.puzzle.puzzle.split('');
        return(
            <View style={{ flexDirection: 'row' }}>
                {letters.map((letter: string, index: number) =>
                    <TouchableOpacity
                        style={{
                            color: greyColor,
                            borderWidth: borderWidthForBoxes,
                            padding: 15,
                            marginHorizontal: 4,
                            borderRadius: borderRadiusForBoxes,
                        }}

                        key={index}
                        onPress={(): void => this.appendLetterToActiveWord(letter)}
                    >
                        <Text style={{ fontSize: 18, color: blackColor }}>{letter}</Text>
                    </TouchableOpacity>)
                }
            </View>
        );
    }

    private renderHUDButtons(): JSX.Element {
        const activeWordState = this.getActiveWordState();
        const buttonColor = this.getColorForActiveWordState(activeWordState);
        const buttonText = activeWordState === ActiveWordState.Valid ? 'Submit' : 'Clear';
        return (
            <View style={{ flexDirection: 'row' }}>
                <Button
                    rounded
                    style={[appStyles.button, { padding: 10, marginHorizontal: 5, backgroundColor: buttonColor }]}
                    onPress={this.submitActiveWord}
                >
                    <Text style={appStyles.buttonText}>{buttonText}</Text>
                </Button>
                {/* TODO Remove  this... */}
                <Button
                    rounded
                    style={[appStyles.button, { padding: 10, marginHorizontal: 5 }]}
                    onPress={goToRouteWithoutParameter(Routes.Main, this.props.history)}
                >
                    <Text style={appStyles.buttonText}>Exit</Text>
                </Button>
            </View>
        );
    }

    private submitActiveWord(): void {
        if (R.not(this.activeWordIsPuzzleWord())) {
            this.clearActiveWord();
            return undefined;
        }
        if (this.activeWordIsFoundWord()) {
            this.clearActiveWord();
            return undefined;
        }
        this.pushActiveWordToWordsFound();
        this.removeActiveWordFromWordsRemaining();
    }

    private activeWordIsPuzzleWord(): boolean {
        return R.includes(this.state.activeWord, this.puzzle.permutations);
    }

    private activeWordIsFoundWord(): boolean {
        return R.includes(this.state.activeWord, this.state.wordsFound);
    }

    private clearActiveWord(): void {
        this.setState({
            activeWord: '',
        });
    }

    private appendLetterToActiveWord(letter: string): void {
        this.setState((state: State) => {
            if (state.activeWord && state.activeWord.length > 7) {
                return state;
            }
            return { activeWord: state.activeWord + letter };
        });
    }

    private pushActiveWordToWordsFound(): void {
        this.setState((state: State) => {
            const targetEmptyValueString = this.buildEmptyValueStringOfLength(state.activeWord.length);
            const indexToPushTo = R.indexOf(targetEmptyValueString, state.wordsFound);
            if (indexToPushTo > -1) {
                return {
                    wordsFound: [
                        ...R.slice(0, indexToPushTo, state.wordsFound),
                        state.activeWord,
                        ...R.slice(indexToPushTo + 1, Infinity, state.wordsFound),
                    ],
                };
            }
            return state;
        });
    }

    private removeActiveWordFromWordsRemaining(): void {
        this.setState((state: State) => {
            if (R.includes(state.activeWord, state.wordsRemaining)) {
                const isActiveWord = (word: string): boolean => word === state.activeWord;
                return {
                    wordsRemaining: R.reject(isActiveWord, state.wordsRemaining),
                    activeWord: '',
                };
            }
            return state;
        });
    }

    private showPuzzleSolution(): void {
        this.setState({
            activeWord: this.solution,
        });
    }

    private puzzleFinishedEarly(): boolean {
        return R.isEmpty(this.state.wordsRemaining) && !! this.timeoutId;
    }

    private endPuzzleTimeElapsed(): void {
        this.setState({ secondsRemaining: 0 });
        if (R.includes(this.solution, this.state.wordsFound)) {
            return this.showPuzzleSuccess();
        }
        return this.showPuzzleFailure();
    }

    private showPuzzleSuccess(): void {
        this.clearTimers();
        Alert.alert('You did it!');
    }

    private showPuzzleFailure(): void {
        this.clearTimers();
        this.showPuzzleSolution();
        Alert.alert('You suck!');
    }

    private clearTimers(): void {
        clearInterval(this.intervalId);
        clearTimeout(this.timeoutId);
    }
}
