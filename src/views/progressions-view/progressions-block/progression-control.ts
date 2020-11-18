import { action, makeObservable, observable } from 'mobx';
import * as Tonal from '@tonaljs/tonal';
import * as Tone from 'tone';

import * as utils from '../../../utils';
import * as ProgData from './progressions-data';
import { ProgressionsControl } from './progressions-control';

export class ProgressionControl {
    chordDuration = 2;
    isPlaying: boolean = false;
    activeChordIndex = -1;

    chords: string[] = [];
    tonalChords: string[] = [];
    sharedScales: string[] = [];
    progInfo: {name: string; info: string};

    constructor(readonly progressionsControl: ProgressionsControl, key: string, prog: ProgData.ProgressionItem) {
        makeObservable(this, {
            chordDuration: observable,
            setChordDuration: action,
            isPlaying: observable,
            setIsPlaying: action,
            activeChordIndex: observable,
            setActiveChordIndex: action,
        });

        const getChords = (prog: ProgData.ProgressionItem) => prog instanceof Array ? prog : prog.chords;
        this.chords = getChords(prog);
        const transformChord = (chord: string) => {
            return chord
                .replace(/([i,v]+)$/, (_, g) => {
                    return g + 'm';
                })
                .replace(/([i,v]+)/, (_, g) => {
                    return g.toUpperCase();
                });
        };
        this.tonalChords = Tonal.Progression.fromRomanNumerals(key, this.chords.map(transformChord));
        this.sharedScales = utils.intersection(
            ...this.tonalChords.map(chord => {
                return Tonal.Chord.chordScales(chord);
            })
        );

        this.progInfo = ((prog: ProgData.ProgressionItem) => {
            if (prog instanceof Array)
                return { name: '', info: '' };
            else
                return { name: prog.name || '', info: prog.info || '' };
        })(prog);
    }

    setIsPlaying(val: boolean) {
        this.isPlaying = val;
    }

    setActiveChordIndex(val: number) {
        this.activeChordIndex = val;
    }

    setChordDuration(val: number) {
        this.chordDuration = val;
    }

    async playProgression() {
        if (this.isPlaying) return;

        const {chordDuration} = this;

        await Tone.start();

        this.setIsPlaying(true);

        const vol = new Tone.Volume(this.progressionsControl.volume).toDestination();
        // const synth = new Tone.PolySynth(Tone.Synth).toDestination();
        const synth = new Tone.PolySynth(Tone.Synth).connect(vol);
        let currentTime = Tone.now();

        this.tonalChords.forEach((tonalChord, i) => {
            const { type, tonic } = Tonal.Chord.get(tonalChord);
            const { notes } = Tonal.Chord.getChord(type, `${tonic}3`);

            // synth.triggerAttackRelease(notes, duration, addTime(duration));
            synth.triggerAttackRelease(notes, chordDuration, currentTime + i * chordDuration);
        });

        let i = 0;
        this.setActiveChordIndex(i);

        const loop = () => {
            setTimeout(() => {
                if (this.activeChordIndex < this.tonalChords.length - 1) {
                    this.setActiveChordIndex(++i);
                    loop();
                }
                else {
                    this.setIsPlaying(false);
                    this.setActiveChordIndex(-1);
                }
            }, chordDuration * 1000);
        };

        loop();
    }
}