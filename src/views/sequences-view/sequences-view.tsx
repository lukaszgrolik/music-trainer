import * as React from 'react';
import { action } from 'mobx';
import { observer } from "mobx-react-lite";
import * as Tonal from '@tonaljs/tonal';
import * as Tone from 'tone';

interface Sequence {
    pattern: string;
    repeat: number;
    move: number;
}

const sequences: Sequence[] = [
    { pattern: '1', repeat: 1, move: 1 },
    { pattern: '123', repeat: 2, move: 1 },
    { pattern: '321', repeat: 2, move: 1 },
    { pattern: '1234', repeat: 2, move: 1 },
    { pattern: '4321', repeat: 2, move: 1 },
    { pattern: '12345432', repeat: 2, move: 1 },
    { pattern: '231', repeat: 1, move: 1 },
    { pattern: '3213', repeat: 1, move: 1 },
    { pattern: '3123', repeat: 1, move: 1 },
    { pattern: '1323', repeat: 1, move: 1 },
    { pattern: '15354535', repeat: 1, move: 1 },
    { pattern: '212321', repeat: 1, move: 1 },
    { pattern: '51413121', repeat: 1, move: 1 },
];

// const bpm = 180 * 4;
// //   const d = '4n';
// const d = 60 / (bpm);

function parseSeqStr(pattern: string) {
    return pattern.split('').map(i => parseInt(i));
}

function getNotes(type: string, tonic: string, name: string, fromOct: number, toOct: number) {
    if (type === 'scale') {
        return Tonal.Scale.rangeOf(`${tonic} ${name}`)(`${tonic}${fromOct}`, `${tonic}${toOct}`);
    }
    else if (type === 'chord') {
        const chordNotes = Tonal.Chord.getChord(name, tonic).notes;
        return Tonal.Scale.rangeOf(chordNotes)(`${tonic}${fromOct}`, `${tonic}${toOct}`);
    }

    return;
}

// @todo move=2 etc
// @todo tone loop - fix clipping?
async function playSequence(bpm: number, notes: string[], seq: Sequence) {
    const d = 60 / bpm;

    await Tone.start()

    const vol = new Tone.Volume(-10).toDestination();
    const synth = new Tone.PolySynth(Tone.Synth).connect(vol);

    const pattern = typeof seq.pattern === 'string' ? parseSeqStr(seq.pattern) : seq.pattern;
    const maxInterval = Math.max(...pattern);

    const patternsCount = (Math.floor(notes.length / Math.abs(seq.move)) - (maxInterval - 1)) * pattern.length;
    const runNotes = new Array(patternsCount * seq.repeat).fill(undefined).map((_, i) => {
        const interval = pattern[i % pattern.length] - 1;
        const noteIndex = interval + Math.floor((i * Math.abs(seq.move)) / (pattern.length * seq.repeat));
        const note = notes[noteIndex];

        //       synth.triggerAttackRelease(note, d, time + d * i);
        //       synth.triggerAttackRelease(note, d, `+${d}`);

        return note;
    });

    const tonePattern = new Tone.Sequence({
        subdivision: d,
        loop: false,
        events: runNotes,
        callback: (time, note) => {
            synth.triggerAttackRelease(note, d, time);
        },
    });
    //     tonePattern.set({loop: false});

    tonePattern.start(Tone.now());
    Tone.Transport.start();
}

export const SequencesView: React.FC = observer(() => {
    const [bpm, setBpm] = React.useState(120);
    const [octaves, setOctaves] = React.useState('3-5');
    const [seqType, setSeqType] = React.useState('scale');
    const [seqName, setSeqName] = React.useState('C major');

    return (
        <div>
            <div>
                <label>
                    <input
                        type="number"
                        value={bpm}
                        style={{width: 40}}
                        onChange={e => {
                            setBpm(e.currentTarget.valueAsNumber);
                        }}
                    />
                </label>

                <label>
                    <input
                        type="string"
                        value={octaves}
                        style={{width: 40}}
                        onChange={e => {
                            setOctaves(e.currentTarget.value);
                        }}
                    />
                </label>

                <label>
                    <select value={seqType} onChange={e => {
                        setSeqType(e.currentTarget.value);
                    }}>
                        <option value="scale">scale</option>
                        <option value="chord">chord</option>
                    </select>
                </label>

                <label>
                    <input
                        type="text"
                        value={seqName}
                        onChange={e => {
                            setSeqName(e.currentTarget.value);
                        }}
                    />
                </label>
            </div>

            <ul>
                {
                    sequences.map(seq => {
                        const onPlayClick = () => {
                            const nameMatch = seqName.match(/(\w) (.+)/);
                            if (!nameMatch) throw new Error('invalid seqName');
                            console.log('nameMatch')

                            const [_, tonic, name] = nameMatch;

                            const [fromOct, toOct] = octaves.split('-');
                            const notes = getNotes(seqType, tonic, name, parseInt(fromOct), parseInt(toOct));

                            if (!notes)
                                console.warn('notes is invalid');
                            else
                                playSequence(bpm, notes as string[], seq);
                        };

                        return (
                            <li key={seq.pattern}>
                                {seq.pattern} (x{seq.repeat}) <button onClick={onPlayClick}>play</button>
                            </li>
                        )
                    })
                }
            </ul>
        </div>
    );
});