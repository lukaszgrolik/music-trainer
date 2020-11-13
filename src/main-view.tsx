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
import { ProgressionsBlock } from './progressions-block';

const guitarScale = (a: number) => a * 3;

export const MainView: React.FunctionComponent<{store: Store}> = observer(({store}) => {
    const [kb] = React.useState(new Keyboard({ octaves: 3 }));
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

    React.useEffect(action(() => {
        kb.showNotes(store.scaleNotes);
        fb.showNotes(store.scaleNotes);
    }), [])

    return (
        <div style={{display: 'flex'}}>
            <div>
                <ScaleFormBlock
                    store={store}
                    onScaleChange={scaleName => {
                        kb.showNotes(store.scaleNotes);
                        fb.showNotes(store.scaleNotes);
                    }}
                />
            </div>

            <div>
                <KeyboardBlock model={kb} />
                <FretboardBlock model={fb} />
                <FretboardShapesBox />
                <ChordsTable store={store} />
                <ProgressionsBlock />
            </div>
        </div>
    )
});