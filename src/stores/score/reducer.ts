import * as constants from '../store_constants';
import { ScoreAction } from './actions';

export interface ScoreStore {
    readonly currentScore: number;
    readonly highScore: number;
}

export const buildDefaultScoreStore = (): ScoreStore => (
    {
        currentScore: 0,
        highScore: 0,
    }
);

export const scoreReducer = (store: ScoreStore = buildDefaultScoreStore(), action: ScoreAction): ScoreStore => {
    if (!action) {
        return store;
    }
    switch (action.type) {
        case constants.SAVE_HIGH_SCORE: {
            return {
                ...store,
                highScore: action.payload.score,
            };
        }
        case constants.SAVE_CURRENT_SCORE: {
            return {
                ...store,
                currentScore: action.payload.score,
            };
        }
        default:
            return store;
    }
};