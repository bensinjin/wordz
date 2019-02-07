import React from 'react';
import { Switch, Route } from 'react-router-native';
import { Routes, routePath } from '../../application/routing';
import { MainScreenComponent } from '../main/main_screen_component';
import { PuzzleScreenConnectedComponent } from '../puzzle/puzzle_screen_connected_component';

export const Router = (): JSX.Element => (
    <Switch>
        <Route exact path={routePath(Routes.Main)} component={MainScreenComponent} />
        <Route exact path={routePath(Routes.Puzzle)} component={PuzzleScreenConnectedComponent} />
    </Switch>
);
