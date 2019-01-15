import * as R from 'ramda';
import { puzzles, Puzzle } from '../puzzles/words_abridged_puzzles';

export const pickPuzzleId = (): string => {
    const numberOfPuzzles = R.keys(puzzles).length;
    const id  = Math.floor(Math.random() * numberOfPuzzles) + 1;
    return id.toString();
};

export const pickPuzzle = (id: number): Puzzle => {
    return puzzles[id];
};

export const pickShuffledLetters = (puzzle: Puzzle): string => {
    const numberOfPuzzles = puzzle.puzzles.length;
    const numberBetweenZeroAndNine = Math.floor(Math.random() * numberOfPuzzles);
    return puzzle.puzzles[numberBetweenZeroAndNine];
};