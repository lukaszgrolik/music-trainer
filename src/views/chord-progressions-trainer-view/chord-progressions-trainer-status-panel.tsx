import * as React from 'react';

import { Panel, Summary } from './chord-progressions-trainer.styles';

type TrainerStatusPanelProps = {
    numerals: string[];
    chords: string[];
    isPlaying: boolean;
    isPaused: boolean;
    playProgress: number;
};

export const TrainerStatusPanel: React.FC<TrainerStatusPanelProps> = props => {
    return (
        <Panel>
            <Summary>
                <div><strong>Numerals:</strong> {props.numerals.join(' - ')}</div>
                <div><strong>Chords:</strong> {props.chords.join(' - ')}</div>
                <div>
                    <strong>Status:</strong> {props.isPlaying ? 'Playing' : (props.isPaused ? 'Paused' : 'Idle')}
                    {' | '}
                    <strong>Position:</strong> {Math.round(props.playProgress * 100)}%
                </div>
            </Summary>
        </Panel>
    );
};
