import React from 'react';
import { Switch, Route } from 'react-router-native';
import { Routes, routePath } from '../../application/routing';
import { MainScreen } from '../main/main_screen';
import { PuzzleScreen } from '../puzzle/puzzle_screen';

export const Router = (): JSX.Element => (
    <Switch>
        <Route exact path={routePath(Routes.Main)} component={MainScreen} />
        <Route exact path={routePath(Routes.Puzzle)} component={PuzzleScreen} />
    </Switch>
);
