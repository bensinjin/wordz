import { StyleSheet, Platform } from 'react-native';

export const colors = {
    white: 'white',
    black: 'black',
    brownBlack: '#5C4D4A',
    seven: '#F28468',
    six: '#82F591',
    five: '#F268D6',
    four: '#8468F2',
    three: '#68F2C9',
};

export const fontFamily = Platform.OS === 'ios' ? 'Courier' : 'monospace';

export const appStyles = StyleSheet.create({
    button: {
        backgroundColor: colors.six,
        borderRadius: 15,
        padding: 15,
    },
    buttonText: {
        fontWeight: 'bold',
        color: colors.brownBlack,
        fontFamily,
    },
    text: {
        fontFamily,
    },
});