import * as React from 'react';
import { action } from 'mobx';
import { observer } from "mobx-react-lite";
import * as Tonal from '@tonaljs/tonal';

import { Keyboard } from './lib/keyboard/keyboard';
import { Fretboard, FretboardTemplateFull } from './lib/fretboard/fretboard';
import { KeyboardBlock } from './keyboard-block';
import { FretboardBlock } from './fretboard-block';
import { FretboardShapesBox } from './fretboard-shapes-box';
import { ChordsTable } from './chords-table';
import { ScaleFormBlock } from './scale-form-block';
import { Store } from './store';
import { ProgressionsBlock } from './progressions-block/progressions-block';

const guitarScale = (a: number) => a * 3;
const guitarScale2 = (a: number) => a * 2;

export const MainView: React.FunctionComponent<{store: Store}> = observer(({store}) => {
    const [kb] = React.useState(new Keyboard({
        octaves: 3,
        whiteKeyWidth: 21,
        whiteKeyHeight: 68,
        blackKeyWidth: 14,
        blackKeyHeight: 42,
        keySizeMultiplier: 3,
    }));
    const [kb2] = React.useState(new Keyboard({
        octaves: 2,
        whiteKeyWidth: 21,
        whiteKeyHeight: 68,
        blackKeyWidth: 14,
        blackKeyHeight: 42,
        keySizeMultiplier: 2,
    }));
    const [kb3] = React.useState(new Keyboard({
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
        frets: 24,
        // startingFret: 0,
        strings: ['E', 'A', 'D', 'G', 'B', 'E'],
        stringsSize: [guitarScale(2), guitarScale(1 / 3)],
        firstFretAreaWidth: guitarScale(35),
        stringAreaHeight: guitarScale(10),
        fretWidth: guitarScale(3),
    }));
    const [fb2] = React.useState(new Fretboard({
        FretboardTemplate: FretboardTemplateFull.FretboardTemplate,
        NoteMarkTemplate: FretboardTemplateFull.NoteMarkTemplate,
        frets: 12,
        // startingFret: 0,
        strings: ['E', 'A', 'D', 'G', 'B', 'E'],
        stringsSize: [guitarScale2(2), guitarScale2(1 / 3)],
        firstFretAreaWidth: guitarScale2(35),
        stringAreaHeight: guitarScale2(10),
        fretWidth: guitarScale2(3),
    }));

    React.useEffect(action(() => {
        drawNotes();
    }), [])

    function drawNotes() {
        kb.showNotes(store.scaleNotes);
        // kb2.showNotes(store.scaleNotes);
        // kb3.showNotes(store.scaleNotes);
        fb.showNotes(store.scaleNotes);
        // fb2.showNotes(store.scaleNotes);
    }

    return (
        <div style={{display: 'flex'}}>
            <div>
                <ScaleFormBlock
                    store={store}
                    onScaleChange={scaleName => {
                        drawNotes();
                    }}
                />
            </div>

            <div>
                <KeyboardBlock model={kb} />
                {/* <KeyboardBlock model={kb2} />
                <KeyboardBlock model={kb3} /> */}

                <FretboardBlock model={fb} />
                {/* <FretboardBlock model={fb2} /> */}

                <FretboardShapesBox />
                <ChordsTable store={store} />
                <ProgressionsBlock />
            </div>
        </div>
    )
});