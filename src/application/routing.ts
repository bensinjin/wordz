import { matchPath, RouteComponentProps } from 'react-router';
import { History } from 'history';

interface MatchParameters {
    readonly puzzleId: string;
}

export type RouterProps = RouteComponentProps<MatchParameters>;

export enum Routes {
    Main,
    Puzzle,
}

export const routePath = (route: Routes): string => {
    switch (route) {
        default:
        case Routes.Main:
            return '/';
        case Routes.Puzzle:
            return '/puzzle';
    }
};

export const routePathWithoutParameter = (route: Routes): string => {
    if (routeHasParameter(route)) {
        throw new Error('The provided route cannot be a parameterized route');
    }

    return routePath(route);
};

export const routePathWithParameter = (route: Routes, parameter: string): string => {
    if (!routeHasParameter(route)) {
        throw new Error('The provided route must be a parameterized route');
    }

    return routePath(route).replace(/:.*/, parameter);
};

export const goToRouteWithoutParameter = (route: Routes, history: History): () => void => {
    const path = routePathWithoutParameter(route);
    // tslint:disable-next-line:no-expression-statement
    return (): void => history.push(path);
};

export const goToRouteWithParameter = (route: Routes, parameter: string, history: History): () => void => {
    const path = routePathWithParameter(route, parameter);
    // tslint:disable-next-line:no-expression-statement
    return (): void => history.push(path);
};

export const goBack = (history: History): void => (
    history.goBack()
);

export const pathMatchesRoute = (path: string, route: Routes): boolean => {
    return !! matchPath(path, { path: routePath(route), exact: true });
};

const routeHasParameter = (route: Routes): boolean => (
    routePath(route).indexOf(':') !== -1
);