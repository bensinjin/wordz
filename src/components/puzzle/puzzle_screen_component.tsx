// tslint:disable:no-expression-statement readonly-keyword readonly-array
import React from 'react';
import * as R from 'ramda';
import { Text, View, TouchableOpacity, Dimensions, TouchableWithoutFeedback } from 'react-native';
import Modal from 'react-native-modal';
import { goToRouteWithoutParameter, Routes, goToRouteWithParameter } from '../../application/routing';
import { Puzzle } from '../../puzzles/words_abridged_puzzles';
import { pickPuzzle, pickSolutionForPuzzle, pickShuffledLetters,
         pickPuzzleId, buildEmptyValuesArray, buildEmptyValueStringOfLength } from '../../application/puzzle_helpers';
import { RouterProps } from '../../application/routing';
import { fontFamily, colors, appStyles  } from '../../application/styles';

// TODO Move these to their appropriate places ...
const emptyLetterValue = '*';
const activeWordHeight = 35;
const wordsFoundHeight = Dimensions.get('screen').height / 1.4;
const borderWidthForBoxes = 1;
const borderRadiusForBoxes = 10;
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
    timeoutId: number;
    intervalId: number;
    activeWord: string;
    activeLetterOrder: string;
    activeLetterOrderDisabledIndexes: ReadonlyArray<number>;
    wordsRemaining: Array<string>;
    wordsFound: Array<string>;
    solutionFound: boolean;
    secondsRemaining: number;
    millisForPuzzle: number;
    score: number;
    endOfLevelModalShowing: boolean;
    puzzleId: string;
    puzzle: Puzzle;
    solution: string;
}

export class PuzzleScreenComponent extends React.Component<RouterProps, State> {

    // TODO Can't we do this in component did update? Is that better??
    static getDerivedStateFromProps(props: RouterProps, state: State): State {
        if (props.match.params.puzzleId !== state.puzzleId) {
            return PuzzleScreenComponent.getFreshState(props.match.params.puzzleId);
        }
        return state;
    }

    static getFreshState(puzzleId: string): State {
        const puzzle = pickPuzzle(puzzleId);
        const solution = pickSolutionForPuzzle(puzzle);
        return {
            timeoutId: 0,
            intervalId: 0,
            activeWord: '',
            activeLetterOrder: pickShuffledLetters(puzzle),
            activeLetterOrderDisabledIndexes: [],
            wordsRemaining: [...puzzle.permutations],
            wordsFound: buildEmptyValuesArray(puzzle.permutations),
            solutionFound: false,
            secondsRemaining: 60,
            millisForPuzzle: 60 * 1000,
            score: 0,
            endOfLevelModalShowing: false,
            puzzleId,
            puzzle,
            solution,
        };
    }

    constructor(props: RouterProps) {
        super(props);
        this.state = PuzzleScreenComponent.getFreshState(this.props.match.params.puzzleId);
        this.endPuzzle = this.endPuzzle.bind(this);
        this.removeSecondFromTimer = this.removeSecondFromTimer.bind(this);
        this.clearActiveWord = this.clearActiveWord.bind(this);
        this.submitActiveWord = this.submitActiveWord.bind(this);
        this.getEndOfLevelModalOnPress = this.getEndOfLevelModalOnPress.bind(this);
    }

    componentDidMount(): void {
        this.setupNewTimers();
    }

    componentWillUnmount(): void {
        this.clearTimers();
    }

    componentDidUpdate(): void {
        if (this.allWordsFound() && this.hasTimers()) {
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

    private removeSecondFromTimer(): void {
        this.setState((state: State) => {
            return { secondsRemaining: state.secondsRemaining - 1 };
        });
    }

    private renderHUD(): JSX.Element {
        return (
            <View style={{ alignSelf: 'stretch', flexDirection: 'row', justifyContent: 'space-evenly' }}>
                <Text style={{ fontSize: HUDTextSize, fontFamily }}>Time: {this.state.secondsRemaining}</Text>
                <Text style={{ fontSize: HUDTextSize, fontFamily }}>Score: {this.state.score}</Text>
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

    private getActiveWordState(): ActiveWordState {
        const wordFound = R.includes(this.state.activeWord, this.state.wordsFound);
        const wordValid = R.includes(this.state.activeWord, this.state.puzzle.permutations);
        return wordFound ? ActiveWordState.Found : wordValid ? ActiveWordState.Valid : ActiveWordState.Invalid;
    }

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
        // TODO Standardize this
        const activeWordState = this.getActiveWordState();
        const submitOrClearButtonText = activeWordState === ActiveWordState.Valid ? 'Submit' : 'Clear';
        const shouldShowShuffle = R.isEmpty(this.state.activeWord);
        const exitOrSkipButtonText = this.state.solutionFound ? 'Go next' : 'Exit';
        const exitOrSkipButtonOnPress = this.state.solutionFound ?
            this.endPuzzle
            :
            goToRouteWithoutParameter(Routes.Main, this.props.history);
        return (
            <View style={{ flexDirection: 'row', marginTop: 5 }}>
                <TouchableOpacity
                    style={[appStyles.button, { marginHorizontal: 5 }]}
                    onPress={(): void => { this.submitActiveWord(); this.clearDisabledIndexes(); }}
                >
                    <Text style={appStyles.buttonText}>{submitOrClearButtonText}</Text>
                </TouchableOpacity>
                {shouldShowShuffle ?
                    <TouchableOpacity
                        style={[appStyles.button, { marginHorizontal: 5 }]}
                        onPress={(): void => { this.shuffleLetters(); this.clearDisabledIndexes(); }}
                    >
                        <Text style={appStyles.buttonText}>Shuffle</Text>
                    </TouchableOpacity>
                    :
                    undefined
                }
                <TouchableOpacity
                    style={[appStyles.button, { marginHorizontal: 5 }]}
                    onPress={exitOrSkipButtonOnPress}
                >
                    <Text style={appStyles.buttonText}>{exitOrSkipButtonText}</Text>
                </TouchableOpacity>
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
                    solutionFound: state.activeWord === state.solution,
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

    private setupNewTimers(): void {
        const timeoutId = setTimeout(this.endPuzzle, this.state.millisForPuzzle);
        const intervalId = setInterval(this.removeSecondFromTimer, 1000);
        this.setState({
            timeoutId,
            intervalId,
        });
    }

    private clearTimers(): void {
        clearInterval(this.state.intervalId);
        clearTimeout(this.state.timeoutId);
    }

    private hasTimers(): boolean {
        return !! (this.state.timeoutId && this.state.intervalId);
    }

    private clearSecondsRemaining(): void {
        if (this.state.secondsRemaining !== 0) {
            this.setState({
                secondsRemaining: 0,
            });
        }
    }

    private allWordsFound(): boolean {
        return R.isEmpty(this.state.wordsRemaining);
    }

    private endPuzzle(): void {
        this.clearTimers();
        this.clearSecondsRemaining();
        this.showEndOfLevelModal();
    }

    private showEndOfLevelModal(): void {
        if (this.state.endOfLevelModalShowing === false) {
            this.setState({
                endOfLevelModalShowing: true,
            });
        }
    }

    private getEndOfLevelModalOnPress(): void {
        if (this.state.solutionFound) {
            // TODO persist score
        }
        const nextPuzzleId = pickPuzzleId(this.state.puzzleId);
        goToRouteWithParameter(Routes.Puzzle, nextPuzzleId, this.props.history)();
        this.setupNewTimers();
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
                    <TouchableOpacity onPress={this.getEndOfLevelModalOnPress} style={appStyles.button}>
                        {buttonContent}
                    </TouchableOpacity>
                </View>
            </Modal>
        );
    }
}
