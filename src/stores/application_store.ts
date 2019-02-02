import { createStore, combineReducers } from 'redux';
import { scoreReducer, ScoreStore, buildDefaultScoreStore } from './score/reducer';

interface Store {
    readonly scores: ScoreStore;
}

const reducer = combineReducers<Store>({
    scores: scoreReducer,
});

const buildDefaultStore = (): Store => (
    {
        scores: buildDefaultScoreStore(),
    }
);

export const store = createStore(reducer, buildDefaultStore());
