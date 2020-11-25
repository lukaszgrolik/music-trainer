import { action, makeObservable, observable } from 'mobx';
import * as Tonal from '@tonaljs/tonal';
import * as Tone from 'tone';

import * as utils from '../../../utils';
import * as ProgData from './progressions-data';
import { ProgressionsControl } from './progressions-control';

export class ProgressionControl {
    chordDuration = 2;
    isPlaying: boolean = false;
    isStopping: boolean = false;
    activeChordIndex = -1;

    chords: string[] = [];
    tonalChords: string[] = [];
    sharedScales: string[] = [];
    progInfo: {name: string; info: string};

    sequence?: Tone.Sequence;
    metronomeSequence?: Tone.Sequence;
    activeChordLoop?: Tone.Loop;

    constructor(readonly progressionsControl: ProgressionsControl, key: string, prog: ProgData.ProgressionItem) {
        makeObservable(this, {
            chordDuration: observable,
            setChordDuration: action,
            isPlaying: observable,
            setIsPlaying: action,
            isStopping: observable,
            setIsStopping: action,
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

    setIsStopping(val: boolean) {
        this.isStopping = val;
    }

    setActiveChordIndex(val: number) {
        this.activeChordIndex = val;
    }

    setChordDuration(val: number) {
        this.chordDuration = val;
    }

    // @todo alternative form: "G one minor six major four minor", "E two diminished five major one minor"
    private sayProgression() {
        const { type, tonic } = Tonal.Chord.get(this.tonalChords[0]);
        const numerals = this.chords.map(num => {
            const map = { 'VII': 7, 'VI': 6, 'IV': 4, 'V': 5, 'III': 3, 'II': 2, 'I': 1 };

            for (const key in map) {
                if (num.toLowerCase().includes(key.toLowerCase())) return map[key as keyof typeof map];
            }

            return 'x';
        });
        let utterance = new SpeechSynthesisUtterance(`${tonic} ${type} ${numerals.join(' ')}`);
        speechSynthesis.speak(utterance);
    }

    async playProgression() {
        if (this.isPlaying) return;

        const {chordDuration} = this;

        await Tone.start();

        this.setIsPlaying(true);

        const vol = new Tone.Volume(this.progressionsControl.volume).toDestination();
        // const synth = new Tone.PolySynth(Tone.Synth).toDestination();
        const synth = new Tone.PolySynth(Tone.Synth).connect(vol);
        // let currentTime = Tone.now();

        // new Tone.Loop(time => {
        //     this.tonalChords.forEach((tonalChord, i) => {
        //         const { type, tonic } = Tonal.Chord.get(tonalChord);
        //         const { notes } = Tonal.Chord.getChord(type, `${tonic}3`);

        //         // synth.triggerAttackRelease(notes, duration, addTime(duration));
        //         // synth.triggerAttackRelease(notes, chordDuration, currentTime + i * chordDuration);
        //         synth.triggerAttackRelease(notes, chordDuration, time + i * chordDuration);
        //     });


        // }, chordDuration * this.tonalChords.length).start(0);

        this.sayProgression();

        this.sequence = new Tone.Sequence({
            subdivision: chordDuration,
            loop: true,
            events: this.tonalChords.map((tonalChord, i) => {
                const { type, tonic } = Tonal.Chord.get(tonalChord);
                const { notes } = Tonal.Chord.getChord(type, `${tonic}3`);

                // synth.triggerAttackRelease(notes, duration, addTime(duration));
                // synth.triggerAttackRelease(notes, chordDuration, currentTime + i * chordDuration);
                // synth.triggerAttackRelease(notes, chordDuration, time + i * chordDuration);
                return { note: notes, duration: chordDuration };
            }),
            callback: (time, note) => synth.triggerAttackRelease(note.note, note.duration, time),
        });

        this.sequence.start(chordDuration);

        this.metronomeSequence = new Tone.Sequence({
            subdivision: .5,
            loop: true,
            events: this.tonalChords.map((tonalChord, i) => {
                const { type, tonic } = Tonal.Chord.get(tonalChord);
                const { notes } = Tonal.Chord.getChord(type, `${tonic}3`);

                // synth.triggerAttackRelease(notes, duration, addTime(duration));
                // synth.triggerAttackRelease(notes, chordDuration, currentTime + i * chordDuration);
                // synth.triggerAttackRelease(notes, chordDuration, time + i * chordDuration);
                return { note: ['A5'], duration: .1 };
            }),
            callback: (time, note) => synth.triggerAttackRelease(note.note, note.duration, time),
        });

        this.metronomeSequence.start(0);

        let i = -1;

        this.activeChordLoop = new Tone.Loop(time => {
            // @todo test Draw.schedule https://github.com/Tonejs/Tone.js/wiki/Performance
            Tone.Draw.schedule(() => {
                i = (this.activeChordIndex < this.tonalChords.length - 1) ? (i + 1) : 0;

                this.setActiveChordIndex(i);
            }, time);
        }, chordDuration)

        this.activeChordLoop.start(chordDuration);

        Tone.Transport.start();
    }

    stopProgression() {
        this.setIsPlaying(false);
        this.setIsStopping(true);

        this.sequence?.stop(0);
        this.sequence?.dispose();

        this.metronomeSequence?.stop(0);
        this.metronomeSequence?.dispose();

        this.activeChordLoop?.stop(0);
        this.activeChordLoop?.dispose();

        // Tone.Transport.cancel(0);
        Tone.Transport.stop(0);

        setTimeout(() => {
            this.setIsStopping(false);
            this.setActiveChordIndex(-1);
        }, this.chordDuration * 1000);
    }
}