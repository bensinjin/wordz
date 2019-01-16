import * as R from 'ramda';
import { puzzles, Puzzle } from '../puzzles/words_abridged_puzzles';

const emptyValueCharacter = '*';

export const pickPuzzleId = (idToExclude?: string): string => {
    const numberOfPuzzles = R.keys(puzzles).length;
    const id = (Math.floor(Math.random() * numberOfPuzzles) + 1).toString();
    if (idToExclude && idToExclude === id) {
        return pickPuzzleId(idToExclude);
    }
    return id;
};

export const pickPuzzle = (id: string): Puzzle => (
    puzzles[id]
);

export const pickShuffledLetters = (puzzle: Puzzle): string => {
    const numberOfPuzzles = puzzle.puzzles.length;
    const numberBetweenZeroAndNine = Math.floor(Math.random() * numberOfPuzzles);
    return puzzle.puzzles[numberBetweenZeroAndNine];
};

export const pickSolutionForPuzzle = (puzzle: Puzzle): string => (
    puzzle.permutations[0]
);

// tslint:disable-next-line:readonly-array
export const buildEmptyValuesArray = (words: ReadonlyArray<string>): Array<string> => {
    return R.map((word: string): string => buildEmptyValueStringOfLength(word.length), words);
};

export const buildEmptyValueStringOfLength = (length: number): string => (
    emptyValueCharacter.repeat(length)
);
