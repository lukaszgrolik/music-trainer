import * as React from 'react';
import { action, observable, reaction } from 'mobx';
import { observer } from "mobx-react-lite";
import * as Tonal from '@tonaljs/tonal';
import * as Tone from 'tone';

import {TrainingControl} from './training-control';
import { TrainingForm } from './training-form';

export const TrainingView: React.FC = observer(() => {
    const [trainingControl] = React.useState(new TrainingControl());

    return (
        <div>
            <div>
                <TrainingForm trainingControl={trainingControl} />
            </div>

            <div>
                <ul>
                    {
                        trainingControl.messages.slice().reverse().slice(0, 20).map(msg => {
                            return (
                                <li key={msg.id}>#{msg.id} {msg.text}</li>
                            );
                        })
                    }
                </ul>
            </div>
        </div>
    );
});