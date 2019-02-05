import { Store } from '../../stores/application_store';

export const selectHighScore = (store: Store): number => (
    store.scores.highScore
);