import React from 'react';
import { Provider } from 'react-redux';
import { Router } from './components/router/router';
import { NativeRouter } from 'react-router-native';
import { store } from './stores/application_store';

export const App = (): JSX.Element => (
    <Provider store={store}>
        <NativeRouter>
            <Router />
        </NativeRouter>
    </Provider>
);
