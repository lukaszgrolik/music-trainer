import * as React from 'react';
import styled from '@emotion/styled';
import { observer } from 'mobx-react-lite';

import * as Tonal from '@tonaljs/tonal';

import * as utils from './utils';

const visibleScales = [
    'major', 'ionian',
    'minor', 'aeolian',
    'major pentatonic', 'minor pentatonic', 'major blues', 'minor blues',
    'dorian', 'phrygian', 'lydian', 'mixolydian',
    'harmonic minor', 'dorian #4', 'phrygian dominant',
    'melodic minor', 'mixolydian b6', 'lydian dominant', 'altered',
    'double harmonic major', 'hungarian minor',
    'bebop',
    'flamenco',
];

type ProgressionItem = string[] | {
    name?: string;
    info?: string;
    chords: string[];
}

const keys = ['A', 'C', 'D', 'E', 'G'];
const progressions: ProgressionItem[] = [
    ['Im', 'IVm', 'Vm'],
    ['Im', 'IVm', 'bVI', 'V7'],
    ['I', 'IV', 'V'],
    ['I', 'IV', 'V'],
    // minor plagal cadence
    { name: 'minor plagal cadence', chords: ['I', 'IVm', 'I'], info: 'iv-I instead of IV-I' },
    { name: 'minor plagal cadence', chords: ['I', 'IV', 'IVm', 'I'], info: 'iv-I instead of IV-I' },
    ...[
        // minor
        ['i', 'bVII', 'bVI'],
        ['bVI', 'i', 'bVII', 'i'],
        ['i', 'bVII', 'bVI', 'bVII'],
        ['i', 'bVI', 'bIII', 'bVII'],
        { chords: ['i', 'bVI', 'iv', 'V'], name: '', info: 'V instead of v' },
        { chords: ['i', 'bVI', 'iv', 'V7'], name: '', info: 'V7 instead of Vm7' },
        { chords: ['i', 'bVII', 'bVI', 'V7'], name: 'andalusian cadence' },
        ['i', 'bIII', 'iv', 'bVI'],
        ['i', 'bIII', 'bVI', 'V7'],
        ['iiø', 'V7', 'i'],
        // harmonic minor
        { chords: ['iiø', 'V', 'i'], name: '', info: 'neoclassical, medieval' },
        ['i', 'V', 'bVI', 'iv'],
        ['i', 'bVI', 'iiø', 'V'],
    ],
];
const openChords = [
    'Em', 'E', 'Am', 'A',
    'D', 'Dm',
    'F', 'Fm',
    'C', 'G',
    // 7, m7, maj7
    'Em7', 'Emaj7', 'E7', 'Am7', 'Amaj7', 'A7', 'Dm7', 'Dmaj7', 'D7'
    // sus2, sus4
    // aug
];
const barChords = [
    '', 'm', 'maj7', 'm7', '7', 'sus2', 'sus4', 'ø', '+'
];

export const ProgressionsBlock = observer(() => {
    const randomBarChords = utils.randomSamples(barChords, barChords.length).map(chord => {
        const letter = utils.randomSample(['A', 'B', 'C', 'D', 'E', 'F', 'G']);
        if (typeof letter !== 'string') throw new Error(`invalid letter: ${letter}`);

        const acc = utils.randomSample(['', 'b', '#']);
        if (typeof acc !== 'string') throw new Error(`invalid accidental: ${acc}`);

        return letter + acc + chord;
    });

    const style = {
        fontFamily: 'Consolas, monospace',
        // 'font-size': '1.2em',
        lineHeight: 1,
    };

    return (
        <div style={style}>
            <div>random open chords: {utils.randomSamples(openChords, openChords.length).join(', ')}</div>
            <div>random bar chords: {randomBarChords.join(', ')}</div>

            {
                utils.randomSamples(progressions, 3).map((prog, i) => {
                    return (
                        <ProgressionBlock key={i} prog={prog} />
                    );
                })
            }
        </div>
    );
})

const space = '.5em';
const ScalesList = styled.div`
    display: flex;
    flex-wrap: wrap;
    margin-top: -${space};
    margin-left: -${space};

    > * {
        margin-top: ${space};
        margin-left: ${space};
    }
`;
const ScaleBlock = styled.div`
    border: 1px solid #ccc;
    padding: .1em .25em;
`;

const ProgressionBlock: React.FunctionComponent<{prog: ProgressionItem}> = observer(({prog}) => {
    const key = utils.randomSample(keys);
    if (!key) throw new Error();

    const getChords = (prog: ProgressionItem) => prog instanceof Array ? prog : prog.chords;
    const chords = getChords(prog);
    const transformChord = (chord: string) => {
        return chord
            .replace(/([i,v]+)$/, (_, g) => {
                return g + 'm';
            })
            .replace(/([i,v]+)/, (_, g) => {
                return g.toUpperCase();
            });
    };
    const tonalChords = Tonal.Progression.fromRomanNumerals(key, chords.map(transformChord));
    const sharedScales = utils.intersection(
        ...tonalChords.map(chord => {
            return Tonal.Chord.chordScales(chord);
        })
    );

    const progInfo = ((prog: ProgressionItem) => {
        if (prog instanceof Array)
            return { name: '', info: '' };
        else
            return { name: prog.name, info: prog.info };
    })(prog);

    const style = {
        border: '1px solid #ddd',
        padding: '.5em',
        marginBottom: '.5em',
    };

    return (
        <div style={style}>
            <div>
                <div style={{ fontWeight: 'bold' }}>{key} - {chords.join('-')} ({tonalChords.join('-')})</div>
                <div>{progInfo.name || 'unnamed'}{progInfo.info ? ` | ${progInfo.info}` : ''}</div>

                <ScalesList style={{ fontSize: '.8em' }}>
                    {
                        sharedScales.filter(s => visibleScales.includes(s)).map((s, i) => {
                            return (
                                <ScaleBlock key={i}>{s}</ScaleBlock>
                            );
                        })
                    }
                </ScalesList>
            </div>

            <table>
                <thead>
                    <tr>
                        {
                            tonalChords.map((chord, i) => {
                                return (
                                    <th key={i}>{chords[i]} - {chord}</th>
                                );
                            })
                        }
                    </tr>
                </thead>

                <tbody>
                    <tr>
                        {
                            tonalChords.map((chord, i) => {
                                return <td key={i}>
                                    {/* <div>piano chord, fretboard chord</div> */}
                                    <ScalesList style={{ fontSize: '.8em',  }}>
                                        {
                                            Tonal.Chord.chordScales(chord).filter(s => visibleScales.includes(s)).map((s, i) => {
                                                return (
                                                    <ScaleBlock key={i}>{s}</ScaleBlock>
                                                );
                                            })
                                        }
                                    </ScalesList>
                                </td>
                            })
                        }
                    </tr>
                </tbody>
            </table>
        </div>
    );
});