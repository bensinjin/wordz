// tslint:disable:no-expression-statement readonly-keyword readonly-array
import React from 'react';
import { View, Text } from 'native-base';
import { fontFamily } from '../../application/styles';

interface TimerProps {
    readonly milliseconds: number;
    readonly timerId: string;
}

interface TimerActions {
    readonly timeElapsedCallback: () => void;
    readonly shouldClearTimers: () => boolean;
}

type Props = TimerProps & TimerActions;

interface State {
    timeoutId: number;
    intervalId: number;
    secondsRemaining: number;
    timerId: number;
}

export class TimerComponent extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            timeoutId: 0,
            intervalId: 0,
            secondsRemaining: 0,
            timerId: 0,
        };
        this.removeSecondFromTimer = this.removeSecondFromTimer.bind(this);
        this.timeElapsed = this.timeElapsed.bind(this);
        this.intervalElapsed = this.intervalElapsed.bind(this);
    }

    componentDidMount(): void {
        this.setupNewTimers();
    }

    componentWillUnmount(): void {
        this.clearTimers();
    }

    componentDidUpdate(previousProps: Props): void {
        if (previousProps.timerId !== this.props.timerId) {
            this.setupNewTimers();
        }
    }

    render(): JSX.Element {
        return (
            <View>
                <Text style={{ fontSize: 25, fontFamily }}>Time: {this.state.secondsRemaining}</Text>
            </View>
        );
    }

    private setupNewTimers(): void {
        const msPerSecond = 1000;
        const timeoutId = setTimeout(this.timeElapsed, this.props.milliseconds);
        const intervalId = setInterval(this.intervalElapsed, msPerSecond);
        const secondsRemaining = this.props.milliseconds / msPerSecond;
        this.setState({
            timeoutId,
            intervalId,
            secondsRemaining,
        });
    }

    private timeElapsed(): void {
        this.props.timeElapsedCallback();
        this.clearTimers();
        this.removeSecondFromTimer();
    }

    private intervalElapsed(): void {
        this.removeSecondFromTimer();
        if (this.props.shouldClearTimers()) {
            this.clearTimers();
        }
    }

    private removeSecondFromTimer(): void {
        this.setState((state: State) => {
            return { secondsRemaining: state.secondsRemaining - 1 };
        });
    }

    private clearTimers(): void {
        clearInterval(this.state.intervalId);
        clearTimeout(this.state.timeoutId);
    }
}