import { Store } from '../../stores/application_store';

export const selectCurrentScore = (store: Store): number => (
    store.scores.currentScore
);