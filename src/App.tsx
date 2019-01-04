import React from 'react';
import { Router } from './components/router/router';
import { NativeRouter } from 'react-router-native';

export const App = (): JSX.Element => (
    <NativeRouter>
        <Router />
    </NativeRouter>
);
