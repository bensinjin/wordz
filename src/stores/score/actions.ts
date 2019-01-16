// tslint:disable:typedef

import * as constants from '../store_constants';
import { makeAction } from '../helpers/make_actions';

type SaveHighScoreAction = Readonly<ReturnType<typeof saveHighScore>>;
type SaveCurrentScoreAction = Readonly<ReturnType<typeof saveCurrentScore>>;

export type ScoreAction = SaveHighScoreAction | SaveCurrentScoreAction;

export const saveHighScore = (score: number) => {
    return makeAction(constants.SAVE_HIGH_SCORE, { score });
};

export const saveCurrentScore = (score: number) => {
    return makeAction(constants.SAVE_CURRENT_SCORE, { score });
};
