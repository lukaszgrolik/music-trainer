import { action, computed, IReactionDisposer, makeObservable, observable, reaction } from "mobx";
import { randomSample } from "../../utils";

import * as TRAINING_DATA from './training-data';

type ParsedChord = {
    letter: string;
    accidental: string;
    type: string;
    inversion?: number;
}

const toggleListItem = action(<T>(list: T[], item: T): void => {
    const index = list.indexOf(item);
    if (index !== -1)
        list.splice(index, 1);
    else
        list.push(item);
});

function speak(msg: string) {
    let utterance = new SpeechSynthesisUtterance(msg);
    speechSynthesis.speak(utterance);
}

function parseChord(chord: string): ParsedChord | undefined {
    const match = chord.match(/(\w)(#|b)?([\w\d\+]+)?(\/(\d))?/);
    if (!match) return;

    return {
        letter: match[1],
        accidental: match[2] || '',
        type: match[3] || '',
        inversion: match[5] ? parseInt(match[5]) : undefined
    };
}

function parseChordsText(str: string): [string, string][] {
    if (!str) return [];

    const chords: [string, string][] = [];

    str.split('\n').forEach(line => {
        if (!line) return;
        if (line.indexOf('//') === 0) return;

        line.trim().split(' ').forEach(name => {
            if (name) {
                const chord = parseChord(name);

                if (!chord) {
                    console.warn(`invalid chord: ${name}`);
                }
                else {
                    const acc = TRAINING_DATA.accidentalsSpeech.find(a => a[0] === chord.accidental);
                    if (!acc) {
                        console.warn(`invalid accidental: ${name}`);
                        return;
                    }

                    const chordType = TRAINING_DATA.chordTypes.find(t => t[0] === chord.type);
                    if (!chordType) {
                        console.warn(`invalid chord type: ${name}`);
                        return;
                    }

                    const numbersSpeech = ['first', 'second'];
                    const inversionSpeech = chord.inversion ? `${numbersSpeech[chord.inversion - 1]} inversion` : '';
                    const speech = `"${chord.letter}" ${acc[1]} ${chordType[1]} ${inversionSpeech}`;
                    chords.push([name, speech]);
                }
            }
        });
    });

    return chords;
}

// function start(tempo: number, lettersList: string[], accidentals: {sharp: boolean; flat: boolean}, chordTypesList: string[], cb: (obj: {name: string; speech: string}) => void) {
export function loop(trainingControl: TrainingControl, cb: (obj: { name: string; speech: string }) => void) {
    const lastChordNames: string[] = [];

    return setInterval(() => {
        // loop to prevent the same consequtive chords
        while (true) {
            let name = '';
            let speech = '';

            if (trainingControl.texts.length && trainingControl.activeText) {
                const chord = randomSample(trainingControl.activeText.chordsFromText);

                name = chord[0];
                speech = chord[1];
            }
            else {
                const letter = randomSample(TRAINING_DATA.letters.filter(l => trainingControl.letters.includes(l)));
                const acc = randomSample(TRAINING_DATA.accidentals.filter(a => trainingControl.accidentals.includes(a[0])));
                const chordType = randomSample(TRAINING_DATA.chordTypes.filter(t => trainingControl.chordTypes.includes(t[0])));
                const scale = randomSample(TRAINING_DATA.scales.filter(s => trainingControl.scales.includes(s)))
                const sequence = randomSample(TRAINING_DATA.sequences.filter(s => trainingControl.sequences.includes(s)));

                if (trainingControl.mode === 'chord') {
                    name = `${letter}${acc[0]}${chordType[0]}`;
                    speech = `"${letter}" ${acc[1]} ${chordType[1]}`;
                }
                else if (trainingControl.mode === 'scale') {
                    name = `${letter}${acc[0]} ${scale} ${sequence}`;

                    const scaleSpeech = scale
                        .replace(/#/g, 'sharp ')
                        .replace(/♭♭/g, 'double flat ')
                        .replace(/♭/g, 'flat ');
                    const sequenceSpeech = sequence.split('').join(' ');
                    speech = `"${letter}" ${acc[1]} ${scaleSpeech} ${sequenceSpeech}`;
                }
            }

            if (lastChordNames.includes(name)) continue;

            speak(speech);
            cb({ name, speech });

            lastChordNames.push(name);
            if (lastChordNames.length > 3) lastChordNames.shift();
            break;
        }
    }, trainingControl.tempo * 1000);
}

export function loop2(trainingControl: TrainingControl, cb: (obj: { name: string; speech: string }) => void) {
    const lastChords: string[] = [];

    return setInterval(() => {
        const {chordsFromText} = trainingControl.activeText;
        const availableChords = chordsFromText.filter(chord => lastChords.includes(chord[0]) === false);
        const chord = randomSample(availableChords);

        if (chordsFromText.length > 3) {
            lastChords.push(chord[0]);
            if (lastChords.length > 3) lastChords.shift();
        }

        const name = chord[0];
        const speech = chord[1];
        // const chord1 = randomSample(trainingControl.activeText.chordsFromText);
        // const chordsRest = trainingControl.activeText.chordsFromText.filter(chord => chord !== chord1);
        // const chord2 = randomSample(chordsRest);
        // const name = `${chord1[0]} -> ${chord2[0]}`;
        // const speech = `${chord1[1]} to  ${chord2[1]}`;

        speak(speech);
        cb({ name, speech });
    }, trainingControl.tempo * 1000);
}

class ChordsText {
    constructor(name: string, text: string) {
        this.name = name;
        this.text = text;

        makeObservable(this, {
            name: observable,
            setName: action,
            text: observable,
            setText: action,
            chordsFromText: computed,
        });
    }

    name = '';
    setName(str: string) {
        this.name = str;
    }

    text = '';
    setText(str: string) {
        this.text = str;
    }

    get chordsFromText(): [string, string][] {
        // console.log('chordsFromText');
        return parseChordsText(this.text);
    }
}

export class TrainingControl {
    isWorking = false;

    constructor() {
        this.texts.push(...TRAINING_DATA.texts.map(t => {
            return new ChordsText(t.name, t.text);
        }));
        this.activeText = this.texts[0];

        makeObservable(this, {
            isWorking: observable,
            mode: observable,
            setMode: action,
            tempo: observable,
            texts: observable,
            activeText: observable,
            setActiveText: action,
            letters: observable,
            accidentals: observable,
            chordTypes: observable,
            scales: observable,
            sequences: observable,
            messages: observable,
        });
    }

    mode: 'chord' | 'scale' = 'chord';
    setMode(mode: 'chord' | 'scale') {
        this.mode = mode;
    }

    tempo = 4;

    texts: ChordsText[] = [];

    activeText: ChordsText;
    setActiveText(text: ChordsText) {
        this.activeText = text;
    }

    letters = TRAINING_DATA.letters;
    toggleLetter(letter: string) {
        toggleListItem(this.letters, letter);
    }

    accidentals = [''];
    toggleAccidental(acc: string) {
        toggleListItem(this.accidentals, acc);
    }

    chordTypes = ['', 'm'];
    checkChordType(chordName: string) {
        toggleListItem(this.chordTypes, chordName);
    }

    scales = ['minor', 'major'];
    checkScale(scaleName: string) {
        toggleListItem(this.scales, scaleName);
    }

    sequences = ['123', '321', '1323', '1234', '212321'];
    checkSequence(sequence: string) {
        toggleListItem(this.sequences, sequence);
    }

    private msgCount = 0;
    messages: { id: number; text: string }[] = [];

    private intId: NodeJS.Timeout | undefined;
    private reactionDisposer: IReactionDisposer | undefined;

    start() {
        this.isWorking = true;

        this.reactionDisposer = reaction(() => [this.tempo, this.letters, this.accidentals, this.chordTypes], () => {
            if (this.isWorking) {
                this.stop();
                this.start();
            }
        });

        this.intId = loop2(this, action(msg => {
            this.msgCount += 1;

            this.messages.push({ id: this.msgCount, text: msg.name });
        }));
    }

    stop() {
        this.isWorking = false;

        if (this.reactionDisposer) this.reactionDisposer();
        if (this.intId) clearInterval(this.intId);
    }
}