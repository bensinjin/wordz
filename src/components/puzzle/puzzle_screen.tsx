// tslint:disable:no-expression-statement readonly-keyword readonly-array
import React from 'react';
import * as R from 'ramda';
import { Text, View, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { Button } from 'native-base';
import Modal from 'react-native-modal';
import { appStyles } from '../../application/styles';
import { goToRouteWithoutParameter, Routes, goToRouteWithParameter } from '../../application/routing';
import { Puzzle } from '../../puzzles/words_abridged_puzzles';
import { pickPuzzle, pickSolutionForPuzzle, pickShuffledLetters, pickPuzzleId } from '../../application/puzzle_helpers';
import { RouterProps } from '../../application/routing';

// TODO Move these to their appropriate places ...
const emptyLetterValue = '*';
const activeWordHeight = 35;
const wordsFoundHeight = Dimensions.get('screen').height / 1.4;
const millisForPuzzle = 60 * 1000;
const whiteColor = 'white';
const darkBlack = 'black';
const blackColor = '#5C4D4A';
const sevenColor = '#F28468';
const sixColor = '#82F591';
const fiveColor = '#F268D6';
const fourColor = '#8468F2';
const threeColor = '#68F2C9';
const borderWidthForBoxes = 1;
const borderRadiusForBoxes = 10;
const fontFamily = Platform.OS === 'ios' ? 'Courier' : 'monospace';
const wordsFoundFontSize = 20;
const activeWordFontSize = 30;
const activeLetterOrderFontSize = 25;
const HUDTextSize = 25;

enum ActiveWordState {
    Valid,
    Invalid,
    Found,
}

interface State {
    activeWord: string;
    activeLetterOrder: string;
    activeLetterOrderDisabledIndexes: ReadonlyArray<number>;
    wordsRemaining: Array<string>;
    wordsFound: Array<string>;
    solutionFound: boolean;
    secondsRemaining: number;
    score: number;
    endOfLevelModalShowing: boolean;
}

export class PuzzleScreen extends React.Component<RouterProps, State> {
    puzzle: Puzzle;
    solution: string;
    timeoutId: number = 0;
    intervalId: number = 0;

    constructor(props: RouterProps) {
        super(props);
        this.puzzle = pickPuzzle(props.match.params.puzzleId);
        this.solution = pickSolutionForPuzzle(this.puzzle);
        this.state = {
            activeWord: '',
            activeLetterOrder: pickShuffledLetters(this.puzzle),
            activeLetterOrderDisabledIndexes: [],
            wordsRemaining: [...this.puzzle.permutations],
            wordsFound: this.fillWordsFoundWithEmptyValues(),
            solutionFound: false,
            secondsRemaining: 60,
            score: 0,
            endOfLevelModalShowing: false,
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
            this.setPuzzleSuccess();
        }
        return (
            <View style={{
                flex: 1,
                paddingTop: 25,
                paddingBottom: 5,
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: blackColor,
            }}>
                {/* TODO Move timer out of component so we don't rerender the entire component when it updates */}
                {this.renderHUD()}
                {this.renderWordsFound()}
                {/* TODO Awkward, clean up */}
                <View style={{ alignItems: 'center' }}>
                    {this.renderActiveWord()}
                    {this.renderButtonsForLetters()}
                    {this.renderHUDButtons()}
                    {this.renderEndOfLevelModal()}
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

    private renderHUD(): JSX.Element {
        return (
            <View style={{ alignSelf: 'stretch', flexDirection: 'row', justifyContent: 'space-evenly' }}>
                <Text style={{ fontSize: HUDTextSize, fontFamily }}>Time: {this.state.secondsRemaining}</Text>
                <Text style={{ fontSize: HUDTextSize, fontFamily }}>Score: {this.state.score}</Text>
            </View>
        );
    }

    private renderWordsFound(): JSX.Element {
        const determineBackgroundColor = (word: string): string => {
            if (word.length === 7) {
                return sevenColor;
            }
            if (word.length ===  6) {
                return sixColor;
            }
            if (word.length === 5) {
                return fiveColor;
            }
            if (word.length === 4) {
                return fourColor;
            }
            return threeColor;
        };
        const determineTextColor = (word: string): string => {
            return R.includes(emptyLetterValue, word) ? determineBackgroundColor(word) : blackColor;
        };
        return (
            <View style={{
                flexDirection: 'row',
                justifyContent: 'center',
                flexWrap: 'wrap',
                maxHeight: wordsFoundHeight,
                overflow: 'hidden',
            }}>
                {this.state.wordsFound.map(
                    (word: string, index: number) =>
                        <View
                            key={index}
                            style={{
                                backgroundColor: determineBackgroundColor(word),
                                borderRadius: 10,
                                padding: 3,
                                margin: 2,
                            }}>
                            <Text
                                style={{
                                    color: determineTextColor(word),
                                    fontSize: wordsFoundFontSize,
                                    fontWeight: 'bold',
                                    fontFamily,
                                }}>
                                {word}
                            </Text>
                        </View>,
                )}
            </View>
        );
    }

    private renderActiveWord(): JSX.Element {
        return (
            <View style={{ height: activeWordHeight }}>
                <Text style={{ fontSize: activeWordFontSize, textAlign: 'center', color: darkBlack, fontFamily }}>
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

    private renderButtonsForLetters(): JSX.Element {
        const activeLetterOrderArray = this.state.activeLetterOrder.split('');
        return(
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
                {activeLetterOrderArray.map((letter: string, index: number) =>
                    this.letterShouldBeDisabled(index) ?
                        this.renderDisabledLetterButton(letter, index)
                        :
                        this.renderEnabledLetterButton(letter, index),
                )}
            </View>
        );
    }

    private renderDisabledLetterButton(letter: string, index: number): JSX.Element {
        return (
            <TouchableOpacity
                key={index}
                disabled={true}
                style={{
                    borderWidth: borderWidthForBoxes,
                    borderColor: blackColor,
                    backgroundColor: blackColor,
                    padding: 12,
                    marginHorizontal: 6,
                    borderRadius: borderRadiusForBoxes,
                }}
            >
                <Text style={{ fontSize: activeLetterOrderFontSize, color: blackColor, fontFamily }}>{letter}</Text>
            </TouchableOpacity>
        );
    }

    private renderEnabledLetterButton(letter: string, index: number): JSX.Element {
        return (
            <TouchableOpacity
                key={index}
                style={{
                    borderWidth: borderWidthForBoxes,
                    borderColor: darkBlack,
                    padding: 12,
                    marginHorizontal: 6,
                    borderRadius: borderRadiusForBoxes,
                }}
                onPress={(): void => this.appendLetterToActiveWord(letter, index)}
            >
                <Text style={{ fontSize: activeLetterOrderFontSize, color: darkBlack, fontFamily }}>{letter}</Text>
            </TouchableOpacity>
        );
    }

    private renderHUDButtons(): JSX.Element {
        const activeWordState = this.getActiveWordState();
        const buttonText = activeWordState === ActiveWordState.Valid ? 'Submit' : 'Clear';
        const shouldShowShuffle = R.isEmpty(this.state.activeWord);
        return (
            <View style={{ flexDirection: 'row', marginTop: 5 }}>
                <Button
                    rounded
                    style={[appStyles.button, { padding: 10, marginHorizontal: 5 }]}
                    onPress={(): void => { this.submitActiveWord(); this.clearDisabledIndexes(); }}
                >
                    <Text style={appStyles.buttonText}>{buttonText}</Text>
                </Button>
                {shouldShowShuffle ?
                    <Button
                        rounded
                        style={[appStyles.button, { padding: 10, marginHorizontal: 5 }]}
                        onPress={(): void => { this.shuffleLetters(); this.clearDisabledIndexes(); }}
                    >
                        <Text style={appStyles.buttonText}>Shuffle</Text>
                    </Button>
                    :
                    undefined
                }
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
        this.scoreValidActiveWord();
        this.removeActiveWordFromWordsRemaining();
        this.clearDisabledIndexes();
    }

    private shuffleLetters(): void {
        this.setState({
            activeLetterOrder: pickShuffledLetters(this.puzzle),
        });
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

    private clearDisabledIndexes(): void {
        this.setState({
            activeLetterOrderDisabledIndexes: [],
        });
    }

    private letterShouldBeDisabled(index: number): boolean {
        return R.includes(index, this.state.activeLetterOrderDisabledIndexes);
    }

    private appendLetterToActiveWord(letter: string, index: number): void {
        this.setState((state: State) => {
            if (state.activeWord && state.activeWord.length > 7) {
                return state;
            }
            return {
                activeWord: state.activeWord + letter,
                activeLetterOrderDisabledIndexes: [
                    ...this.state.activeLetterOrderDisabledIndexes,
                    index,
                ],
            };
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

    private scoreValidActiveWord(): void {
        this.setState({
            score: this.state.score + this.state.activeWord.length,
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

    private puzzleFinishedEarly(): boolean {
        return R.isEmpty(this.state.wordsRemaining) && !!this.timeoutId;
    }

    private endPuzzleTimeElapsed(): void {
        this.setState({ secondsRemaining: 0 });
        this.clearTimers();
        if (R.includes(this.solution, this.state.wordsFound)) {
            this.setPuzzleSuccess();
        }
        this.showEndOfLevelModal();
    }

    private clearTimers(): void {
        clearInterval(this.intervalId);
        clearTimeout(this.timeoutId);
    }

    private showEndOfLevelModal(): void {
        this.setState({
            endOfLevelModalShowing: true,
        });
    }

    private hideEndOfLevelModal(): void {
        this.setState({
            endOfLevelModalShowing: false,
        });
    }

    private setPuzzleSuccess(): void {
        this.setState({
            solutionFound: true,
        });
    }

    private getEndOfLevelModalOnPress(): () => void {
        const nextPuzzleId = pickPuzzleId(this.props.match.params.puzzleId);
        if (this.state.solutionFound) {
            // TODO persist score
        }
        return (): void => {
            this.hideEndOfLevelModal();
            goToRouteWithParameter(Routes.Puzzle, nextPuzzleId, this.props.history);
        };
    }

    private renderEndOfLevelModal(): JSX.Element {
        const content = this.state.solutionFound ?
            <Text>Congratulations! Solution found.</Text>
            :
            <Text>Solution: {this.solution}</Text>;
        const buttonContent = this.state.solutionFound ?
            <Text>Next level</Text>
            :
            <Text>Retry</Text>;
        return (
            <View style={{ flex: 1 }}>
                <Modal isVisible={this.state.endOfLevelModalShowing}>
                    <View style={{ flex: 1 }}>
                        {content}
                        <TouchableOpacity onPress={this.getEndOfLevelModalOnPress}>
                            {buttonContent}
                        </TouchableOpacity>
                    </View>
                </Modal>
            </View>
        );
    }
}
