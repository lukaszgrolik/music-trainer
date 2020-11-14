import * as React from 'react';
import styled from '@emotion/styled';
import { observer } from 'mobx-react-lite';
import * as Tonal from '@tonaljs/tonal';

import * as utils from './utils';
import { Keyboard } from './lib/keyboard/keyboard';
import { KeyboardBlock } from './keyboard-block';
import { Fretboard, FretboardTemplateFull } from './lib/fretboard/fretboard';
import { FretboardBlock } from './fretboard-block';

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

function getRandomOpenChords() {
    return utils.randomSamples(openChords, openChords.length);
}

function getRandomBarChords() {
    return utils.randomSamples(barChords, barChords.length).map(chord => {
        const letter = utils.randomSample(['A', 'B', 'C', 'D', 'E', 'F', 'G']);
        if (typeof letter !== 'string') throw new Error(`invalid letter: ${letter}`);

        const acc = utils.randomSample(['', 'b', '#']);
        if (typeof acc !== 'string') throw new Error(`invalid accidental: ${acc}`);

        return letter + acc + chord;
    });
}

function getRandomProgressions() {
    return utils.randomSamples(progressions, 3);
}

export const ProgressionsBlock = observer(() => {
    const [randomOpenChords] = React.useState(getRandomOpenChords());
    const [randomBarChords] = React.useState(getRandomBarChords());
    const [showDiagrams, setShowDiagrams] = React.useState(false);
    const [showScales, setShowScales] = React.useState(false);
    const [randomProgressions] = React.useState(getRandomProgressions());

    const style = {
        fontFamily: 'Consolas, monospace',
        // 'font-size': '1.2em',
        lineHeight: 1,
    };

    return (
        <div style={style}>
            <Header>
                <ChordsWrapper>
                    <div>random open chords:</div>

                    <div>
                        <ChordsList>
                            {
                                randomOpenChords.map(chord => {
                                    return <ChordBlock key={chord}>{chord}</ChordBlock>
                                })
                            }
                        </ChordsList>
                    </div>
                </ChordsWrapper>

                <ChordsWrapper>
                    <div>random bar chords:</div>

                    <div>
                        <ChordsList>
                            {
                                randomBarChords.map(chord => {
                                    return <ChordBlock key={chord}>{chord}</ChordBlock>
                                })
                            }
                        </ChordsList>
                    </div>
                </ChordsWrapper>
            </Header>

            <div>
                <label>
                    <input
                        type="checkbox"
                        checked={showDiagrams}
                        onChange={e => setShowDiagrams(e.currentTarget.checked)}
                    />
                    show diagrams
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={showScales}
                        onChange={e => setShowScales(e.currentTarget.checked)}
                    />
                    show scales
                </label>
            </div>

            {
                randomProgressions.map((prog, i) => {
                    return (
                        <ProgressionBlock key={i} prog={prog} showDiagrams={showDiagrams} showScales={showScales} />
                    );
                })
            }
        </div>
    );
})

const Header = styled.div`
    > * + * {
        margin-top: 1em;
    }
`;
const ChordsWrapper = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;

    > * + * {
        margin-left: 1em;
    }
`;

const chordsListSpace = '.5em';
const ChordsList = styled.div`
    display: flex;
    flex-wrap: wrap;
    margin-top: -${chordsListSpace};
    margin-left: -${chordsListSpace};

    > * {
        margin-top: ${chordsListSpace};
        margin-left: ${chordsListSpace};
    }
`;
const ChordBlock = styled.div`
    border: 1px solid #ccc;
    padding: .1em .25em;
`;

const scalesListSpace = '.5em';
const ScalesList = styled.div`
    display: flex;
    flex-wrap: wrap;
    margin-top: -${scalesListSpace};
    margin-left: -${scalesListSpace};

    > * {
        margin-top: ${scalesListSpace};
        margin-left: ${scalesListSpace};
    }
`;
const ScaleBlock = styled.div`
    border: 1px solid #ccc;
    padding: .1em .25em;
`;

const ProgressionBlock: React.FunctionComponent<{prog: ProgressionItem; showDiagrams: boolean; showScales: boolean}> = observer(({prog, showDiagrams, showScales}) => {
    const [key] = React.useState(utils.randomSample(keys));
    if (!key) throw new Error('key is invalid');

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

                {
                    showScales
                    &&
                    <ScalesList style={{ fontSize: '.8em' }}>
                        {
                            sharedScales.filter(s => visibleScales.includes(s)).map((s, i) => {
                                return (
                                    <ScaleBlock key={i}>{s}</ScaleBlock>
                                    );
                                })
                        }
                    </ScalesList>
                }
            </div>

            <table>
                <thead>
                    <tr>
                        {
                            tonalChords.map((chord, i) => {
                                return (
                                    <th key={i}>
                                        <div style={{border: '1px solid #bbb', padding: '.25em .5em'}}>{chords[i]} - {chord}</div>
                                    </th>
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
                                    <ProgressionChordBlock chord={chord} showDiagrams={showDiagrams} showScales={showScales} />
                                </td>
                            })
                        }
                    </tr>
                </tbody>
            </table>
        </div>
    );
});

const guitarScale = (a: number) => a * 2;

const ProgressionChordBlock: React.FC<{chord: string; showDiagrams: boolean; showScales: boolean}> = observer(({chord, showDiagrams, showScales}) => {
    const [kb] = React.useState(new Keyboard({
        octaves: 2,
        whiteKeyWidth: 21,
        whiteKeyHeight: 68,
        blackKeyWidth: 14,
        blackKeyHeight: 42,
        keySizeMultiplier: 1,
    }));
    const [fb] = React.useState(new Fretboard({
        FretboardTemplate: FretboardTemplateFull.FretboardTemplate,
        NoteMarkTemplate: FretboardTemplateFull.NoteMarkTemplate,
        frets: 12,
        // startingFret: 0,
        strings: ['E', 'A', 'D', 'G', 'B', 'E'],
        stringsSize: [guitarScale(2), guitarScale(1 / 3)],
        firstFretAreaWidth: guitarScale(35),
        stringAreaHeight: guitarScale(10),
        fretWidth: guitarScale(3),
    }));

    React.useEffect(() => {
        if (showDiagrams) {
            const notes = Tonal.Chord.get(chord).notes;
            kb.showNotes(notes);
            fb.showNotes(notes);
        }
    }, [showDiagrams]);

    return (
        <div>
            {/* <div>piano chord, fretboard chord</div> */}
            {
                showDiagrams
                &&
                <div>
                    <FretboardBlock model={fb} />
                    <KeyboardBlock model={kb} />
                </div>
            }

            {
                showScales
                &&
                <ScalesList style={{ fontSize: '.8em' }}>
                    {
                        Tonal.Chord.chordScales(chord).filter(s => visibleScales.includes(s)).map((s, i) => {
                            return (
                                <ScaleBlock key={i}>{s}</ScaleBlock>
                                );
                            })
                    }
                </ScalesList>
            }
        </div>
    );
});