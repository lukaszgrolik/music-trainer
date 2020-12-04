import * as React from 'react';
import { action, observable, reaction } from 'mobx';
import { observer } from "mobx-react-lite";

import {TrainingControl} from './training-control';
import * as TRAINING_DATA from './training-data';

export const TrainingForm: React.FC<{ trainingControl: TrainingControl}> = observer(({trainingControl}) => {
    return (
        <div>
            <div>
                <input
                    type="number"
                    value={trainingControl.tempo}
                    style={{ width: 30 }}
                    onChange={e => action(() => trainingControl.tempo = e.currentTarget.valueAsNumber)()}
                />

                <button onClick={action(() => {
                    if (trainingControl.isWorking)
                        trainingControl.stop();
                    else
                        trainingControl.start();
                })}>{trainingControl.isWorking ? 'stop' : 'start'}</button>
            </div>

            <div>
                {
                    (['chord', 'scale'] as ('chord' | 'scale')[]).map(mode => {
                        return (
                            <label key={mode}>
                                <input
                                    type="radio"
                                    checked={trainingControl.mode === mode}
                                    onChange={e => trainingControl.setMode(mode)}
                                />

                                {mode}
                            </label>
                        )
                    })
                }
            </div>

            <div style={{ display: 'flex' }}>
                <div style={{display: 'flex'}}>
                    <div>
                        {
                            trainingControl.texts.map((text, i) => {
                                return (
                                    <div key={i}>
                                        <button
                                            style={{display: 'block', width: '100%', fontWeight: trainingControl.activeText === text ? 'bold' : 'normal'}}
                                            onClick={() => trainingControl.setActiveText(text)}
                                        >{text.name}</button>
                                    </div>
                                );
                            })
                        }
                    </div>

                    {
                        trainingControl.texts.map((text, i) => {
                            return (
                                <textarea
                                    key={i}
                                    cols={60}
                                    rows={40}
                                    value={text.text}
                                    style={{display: trainingControl.activeText === text ? 'block' : 'none'}}
                                    onChange={e => text.setText(e.currentTarget.value)}
                                />
                            );
                        })
                    }
                </div>

                <div>
                    {
                        TRAINING_DATA.letters.map(letter => {
                            return (
                                <div key={letter}>
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={trainingControl.letters.includes(letter)}
                                            onChange={e => trainingControl.toggleLetter(letter)}
                                        />
                                        {letter}
                                    </label>
                                </div>
                            );
                        })
                    }
                </div>

                <div>
                    {
                        TRAINING_DATA.accidentals.map(acc => {
                            return (
                                <div key={acc[0]}>
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={trainingControl.accidentals.includes(acc[0])}
                                            onChange={e => trainingControl.toggleAccidental(acc[0])}
                                        />
                                        {acc[1]}
                                    </label>
                                </div>
                            );
                        })
                    }
                </div>

                <div style={{display: trainingControl.mode === 'chord' ? 'block' : 'none'}}>
                    {
                        TRAINING_DATA.chordTypes.map(chordType => {
                            return (
                                <div key={chordType[0]}>
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={trainingControl.chordTypes.includes(chordType[0])}
                                            onChange={e => trainingControl.checkChordType(chordType[0])}
                                        />

                                        {chordType[0]}
                                    </label>
                                </div>
                            )
                        })
                    }
                </div>

                <div>
                    {/* 1st inverse */}
                    {/* 2nd inverse */}
                </div>

                <div style={{display: trainingControl.mode === 'scale' ? 'block' : 'none'}}>
                    {
                        TRAINING_DATA.scales.map(scale => {
                            return (
                                <div key={scale}>
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={trainingControl.scales.includes(scale)}
                                            onChange={e => trainingControl.checkScale(scale)}
                                        />

                                        {scale}
                                    </label>
                                </div>
                            )
                        })
                    }
                </div>

                <div style={{ display: trainingControl.mode === 'scale' ? 'block' : 'none' }}>
                    {
                        TRAINING_DATA.sequences.map(seq => {
                            return (
                                <div key={seq}>
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={trainingControl.sequences.includes(seq)}
                                            onChange={e => trainingControl.checkSequence(seq)}
                                        />

                                        {seq}
                                    </label>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        </div>
    )
});