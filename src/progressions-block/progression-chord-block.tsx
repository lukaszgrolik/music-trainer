import * as React from 'react';
import styled from '@emotion/styled';
import { reaction } from 'mobx';
import { observer } from 'mobx-react-lite';
import * as Tonal from '@tonaljs/tonal';
import * as Tone from 'tone';

import * as ProgData from './progressions-data';
import { ProgressionsControl } from './progressions-control';
import { Keyboard } from '../lib/keyboard/keyboard';
import { KeyboardBlock } from '../keyboard-block';
import { Fretboard, FretboardTemplateFull } from '../lib/fretboard/fretboard';
import { FretboardBlock } from '../fretboard-block';
import { ScaleBlock, ScalesList } from './scales-list';

const guitarScale = (a: number) => a * 2;

interface Props {
    chord: string;
    progressionsControl: ProgressionsControl;
}

export const ProgressionChordBlock: React.FC<Props> = observer(({ chord, progressionsControl }) => {
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
        return reaction(() => progressionsControl.showDiagrams, showDiagrams => {
            if (showDiagrams) {
                const notes = Tonal.Chord.get(chord).notes;
                kb.showNotes(notes);
                fb.showNotes(notes);
            }
        }, {fireImmediately: true})
    }, []);

    return (
        <div>
            {/* <div>piano chord, fretboard chord</div> */}

            <div style={{display: progressionsControl.showDiagrams ? 'block' : 'none'}}>
                <FretboardBlock model={fb} />
                <KeyboardBlock model={kb} />
            </div>

            {
                progressionsControl.showScales
                &&
                <ScalesList style={{ fontSize: '.8em' }}>
                    {
                        Tonal.Chord.chordScales(chord).filter(s => ProgData.visibleScales.includes(s)).map((s, i) => {
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