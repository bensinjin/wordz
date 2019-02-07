// tslint:disable:no-expression-statement readonly-keyword readonly-array
import React from 'react';
import * as R from 'ramda';
import { Text, View, TouchableOpacity, Dimensions, TouchableWithoutFeedback } from 'react-native';
import Modal from 'react-native-modal';
import { goToRouteWithoutParameter, Routes, RouterProps } from '../../application/routing';
import { Puzzle } from '../../puzzles/words_abridged_puzzles';
import { pickPuzzle, pickSolutionForPuzzle, pickShuffledLetters,
         pickPuzzleId, buildEmptyValuesArray, buildEmptyValueStringOfLength } from '../../application/puzzle_helpers';
import { fontFamily, colors, appStyles  } from '../../application/styles';
import { TimerComponent } from '../timer/timer_component';
import { SaveCurrentScoreAction, SaveHighScoreAction } from '../../stores/score/actions';

// TODO Move these to their appropriate places ...
const emptyLetterValue = '*';
const activeWordHeight = 35;
const wordsFoundHeight = Dimensions.get('screen').height / 1.4;
const borderWidthForBoxes = 1;
const borderRadiusForBoxes = 10;
const wordsFoundFontSize = 20;
const activeWordFontSize = 30;
const activeLetterOrderFontSize = 25;
const HUDTextSize = 22;

export interface PuzzleScreenProps {
    readonly currentScore: number;
    readonly highScore: number;
}

export interface PuzzleScreenActions {
    readonly saveCurrentScore: (score: number) => SaveCurrentScoreAction;
    readonly saveHighScore: (score: number)  => SaveHighScoreAction;
}

interface State {
    activeWord: string;
    activeLetterOrder: string;
    activeLetterOrderDisabledIndexes: ReadonlyArray<number>;
    wordsRemaining: Array<string>;
    wordsFound: Array<string>;
    solutionFound: boolean;
    score: number;
    endOfLevelModalShowing: boolean;
    puzzleId: string;
    puzzle: Puzzle;
    solution: string;
    millisecondsRemaining: number;
}

type Props = PuzzleScreenProps & PuzzleScreenActions & RouterProps;

export class PuzzleScreenComponent extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.getFreshState();
        this.endPuzzle = this.endPuzzle.bind(this);
        this.clearActiveWord = this.clearActiveWord.bind(this);
        this.backspaceActiveWord = this.backspaceActiveWord.bind(this);
        this.submitActiveWord = this.submitActiveWord.bind(this);
        this.finishRound = this.finishRound.bind(this);
    }

    componentDidUpdate(): void {
        if (this.allWordsFound()) {
            this.endPuzzle();
        }
    }

    render(): JSX.Element {
        return (
            <View
                style={{
                    flex: 1,
                    paddingTop: 25,
                    paddingBottom: 5,
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: colors.brownBlack,
                }}
            >
                {/* TODO Move timer out of component so we don't rerender the entire component when it updates */}
                {this.renderHUD()}
                {this.renderWordsFound()}
                {/* TODO Awkward, clean up */}
                <View style={{ alignItems: 'center' }}>
                    {this.renderActiveWord()}
                    {this.renderButtonsForLetters()}
                    {this.renderHUDButtons()}
                </View>
                {this.renderEndOfLevelModal()}
            </View>
        );
    }

    // TODO this is rather large
    private getFreshState(): void {
        const puzzleId = this.state ? pickPuzzleId(this.state.puzzleId) : pickPuzzleId();
        const puzzle = pickPuzzle(puzzleId);
        const solution = pickSolutionForPuzzle(puzzle);
        const freshState = {
            activeWord: '',
            activeLetterOrder: pickShuffledLetters(puzzle),
            activeLetterOrderDisabledIndexes: [],
            wordsRemaining: [...puzzle.permutations],
            wordsFound: buildEmptyValuesArray(puzzle.permutations),
            solutionFound: false,
            score: this.props.currentScore,
            endOfLevelModalShowing: false,
            millisecondsRemaining: 60000,
            puzzleId,
            puzzle,
            solution,
        };
        if (this.state) {
            this.setState(freshState);
        } else {
            this.state = freshState;
        }
    }

    private renderHUD(): JSX.Element {
        return (
            <View style={{ alignItems: 'center' }}>
                <TimerComponent
                    milliseconds={this.state.millisecondsRemaining}
                    timeElapsedCallback={this.endPuzzle}
                    shouldClearTimers={(): boolean => this.allWordsFound()}
                    timerId={this.state.puzzleId}
                />
                <View style={{ alignSelf: 'stretch', flexDirection: 'row', justifyContent: 'space-evenly' }}>
                    <Text style={{ fontSize: HUDTextSize, fontFamily }}>Score: {this.state.score} </Text>
                    <Text style={{ fontSize: HUDTextSize, fontFamily }}>High Score: {this.props.highScore}</Text>
                </View>
            </View>
        );
    }

    // TODO Too long
    private renderWordsFound(): JSX.Element {
        const determineBackgroundColor = (word: string): string => {
            if (word.length === 7) {
                return colors.seven;
            }
            if (word.length ===  6) {
                return colors.six;
            }
            if (word.length === 5) {
                return colors.five;
            }
            if (word.length === 4) {
                return colors.four;
            }
            return colors.three;
        };
        const determineTextColor = (word: string): string => {
            return R.includes(emptyLetterValue, word) ? determineBackgroundColor(word) : colors.brownBlack;
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
                <Text style={{ fontSize: activeWordFontSize, textAlign: 'center', color: colors.black, fontFamily }}>
                    {this.state.activeWord}
                </Text>
            </View>
        );
    }

    // TODO move this into its own component
    private renderButtonsForLetters(): JSX.Element {
        const activeLetterOrderArray = this.state.activeLetterOrder.split('');
        return(
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
                {activeLetterOrderArray.map((letter: string, index: number) =>
                    this.letterShouldBeDisabled(index) ?
                        this.renderLetterButton(
                            true,
                            colors.brownBlack,
                            colors.brownBlack,
                            colors.brownBlack,
                            index,
                            letter,
                        )
                        :
                        this.renderLetterButton(
                            false,
                            colors.black,
                            colors.brownBlack,
                            colors.black,
                            index,
                            letter,
                        ),
                )}
            </View>
        );
    }

    // TODO move this into its own component
    private renderLetterButton(disabled: boolean, borderColor: string, backgroundColor: string, textColor: string, index: number, letter: string):
        JSX.Element {
        return (
            <TouchableWithoutFeedback
                key={index}
                disabled={disabled}
                onPress={(): void => this.appendLetterToActiveWord(letter, index)}
            >
                <View
                    style={{
                        borderColor,
                        backgroundColor,
                        borderWidth: borderWidthForBoxes,
                        padding: 16,
                        marginHorizontal: 2,
                        borderRadius: borderRadiusForBoxes,
                    }}
                >
                    <Text style={{ fontSize: activeLetterOrderFontSize, color: textColor, fontFamily }}>{letter}</Text>
                </View>
            </TouchableWithoutFeedback>
        );
    }

    private renderHUDButtons(): JSX.Element {
        const activeWordIsEmpty = R.isEmpty(this.state.activeWord);
        const submitClearBackspaceButton = (
            <View style={{ flexDirection: 'row', marginTop: 5 }}>
                <TouchableOpacity
                    style={[appStyles.button, { marginHorizontal: 5 }]}
                    onPress={(): void => { this.submitActiveWord(); this.clearDisabledIndexes(); }}
                >
                    <Text style={appStyles.buttonText}>Submit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[appStyles.button, { marginHorizontal: 5 }]}
                    // onPress={(): void => { this.clearActiveWord(); this.clearDisabledIndexes(); }}
                    onPress={this.backspaceActiveWord}
                >
                    <Text style={appStyles.buttonText}>Backspace</Text>
                </TouchableOpacity>
            </View>
        );
        const shuffleButton = (
            <View style={{ marginTop: 5 }}>
                <TouchableOpacity
                    style={[appStyles.button, { marginHorizontal: 5 }]}
                    onPress={(): void => { this.shuffleLetters(); this.clearDisabledIndexes(); }}
                >
                    <Text style={appStyles.buttonText}>Shuffle</Text>
                </TouchableOpacity>
            </View>
        );

        return activeWordIsEmpty ? shuffleButton : submitClearBackspaceButton;
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
            activeLetterOrder: pickShuffledLetters(this.state.puzzle),
        });
    }

    private activeWordIsPuzzleWord(): boolean {
        return R.includes(this.state.activeWord, this.state.puzzle.permutations);
    }

    private activeWordIsFoundWord(): boolean {
        return R.includes(this.state.activeWord, this.state.wordsFound);
    }

    private clearActiveWord(): void {
        this.setState({
            activeWord: '',
        });
    }

    private backspaceActiveWord(): void {
        // TODO, Need to track where to "put back" the letter when backspaced.
        // We can do this by tracking where it was when it was added to the "activeLetterDisabledIndexes" array.
        // If we store say an object like: { fromIndex: number, value: string }, ie. { disabledIndex: 3, value: 'b' }
        // we can properly re enable the right value or whaterve ...
        this.setState({
            activeWord: this.state.activeWord.substr(0, this.state.activeWord.length - 1),
            // TODO 
            // activeLetterOrderDisabledIndexes: R.reject(isRemovedIndex, this.state.activeLetterOrderDisabledIndexes),
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
            const targetEmptyValueString = buildEmptyValueStringOfLength(state.activeWord.length);
            const indexToPushTo = R.indexOf(targetEmptyValueString, state.wordsFound);
            if (indexToPushTo > -1) {
                return {
                    wordsFound: [
                        ...R.slice(0, indexToPushTo, state.wordsFound),
                        state.activeWord,
                        ...R.slice(indexToPushTo + 1, Infinity, state.wordsFound),
                    ],
                    solutionFound: this.state.solutionFound ? true : state.activeWord === state.solution ? true : false,
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

    private scoreValidActiveWord(): void {
        this.setState({
            score: this.state.score + this.state.activeWord.length,
        });
    }

    private allWordsFound(): boolean {
        return R.isEmpty(this.state.wordsRemaining);
    }

    private endPuzzle(): void {
        if (this.state.endOfLevelModalShowing === false) {
            this.setState({
                endOfLevelModalShowing: true,
            });
        }
    }

    private renderEndOfLevelModal(): JSX.Element {
        const content = this.state.solutionFound ?
            <Text style={appStyles.text}>Congratulations! Solution found.</Text>
            :
            <Text style={appStyles.text}>You lose! Solution: {this.state.solution}</Text>;
        const buttonContent = this.state.solutionFound ?
            <Text style={appStyles.buttonText}>Next level</Text>
            :
            <Text style={appStyles.buttonText}>Retry</Text>;
        return (
            <Modal isVisible={this.state.endOfLevelModalShowing}>
                <View style={{
                    backgroundColor: colors.white,
                    borderRadius: 10,
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 20,
                }}>
                    <View style={{ marginBottom: 20 }}>
                        {content}
                    </View>
                    <TouchableOpacity onPress={this.finishRound} style={appStyles.button}>
                        {buttonContent}
                    </TouchableOpacity>
                </View>
            </Modal>
        );
    }

    private async finishRound(): Promise<void> {
        const currentScore = this.props.currentScore + this.state.score;
        if (currentScore > this.props.highScore) {
            await this.props.saveHighScore(currentScore);
        }
        if (this.state.solutionFound) {
            await this.props.saveCurrentScore(currentScore);
        } else {
            await this.props.saveCurrentScore(0);
        }

        this.getFreshState();
    }

}
