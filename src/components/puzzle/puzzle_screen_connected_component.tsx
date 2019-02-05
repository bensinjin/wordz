import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { Store } from '../../stores/application_store';
import { selectCurrentScore } from '../../selectors/score/select_current_score';
import { selectHighScore } from '../../selectors/score/select_high_score';
import { PuzzleScreenProps, PuzzleScreenActions, PuzzleScreenComponent } from './puzzle_screen_component';
import { SaveCurrentScoreAction, SaveHighScoreAction, saveCurrentScore, saveHighScore } from '../../stores/score/actions';

const mapStateToProps = (store: Store): PuzzleScreenProps => ({
    currentScore: selectCurrentScore(store),
    highScore: selectHighScore(store),
});

type DispatchActions = SaveCurrentScoreAction | SaveHighScoreAction;

const mapDispatchToProps = (dispatch: Dispatch<DispatchActions>): PuzzleScreenActions => ({
    saveCurrentScore: (score: number): SaveCurrentScoreAction => dispatch(saveCurrentScore(score)),
    saveHighScore: (score: number): SaveHighScoreAction => dispatch(saveHighScore(score)),
});

export const PuzzleScreenConnectedComponent = connect(mapStateToProps, mapDispatchToProps)(PuzzleScreenComponent);