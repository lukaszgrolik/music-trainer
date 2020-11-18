
import * as React from 'react';
import { observer } from 'mobx-react-lite';
import * as Tonal from '@tonaljs/tonal';

import { Fretboard, FretboardTemplateShapes } from '../../lib/fretboard/fretboard';
import { FretboardBlock } from '../../fretboard-block';

type ScaleShape = {
    scale: string;
    frets: number;
    strings?: number;
};
type ChordShape = {
    chord: string;
    frets: number;
    strings?: number;
}
type Shape = ScaleShape | ChordShape;

function isScaleShape(shape: Shape): shape is ScaleShape {
    return shape.hasOwnProperty('scale');
}

function isChordShape(shape: Shape): shape is ScaleShape {
    return shape.hasOwnProperty('chord');
}

interface ShapeGroup {
    id: string;
    shapes: Shape[];
}

const shapes: ShapeGroup[] = [
    {
        id: 'minor-scale',
        shapes: [
            {
                scale: 'F minor',
                frets: 4,
            },
            {
                scale: 'G minor',
                frets: 5,
            },
            {
                scale: 'G# minor',
                frets: 4,
                strings: 4,
            }
        ],
    },
    {
        id: 'major-scale',
        shapes: [
            {
                scale: 'F# major',
                frets: 4,
            },
            {
                scale: 'F major',
                frets: 5,
            },
            {
                scale: 'G# major',
                frets: 4,
                strings: 4,
            }
        ],

    },
    {
        id: 'minor-triad',
        shapes: [
            {
                chord: 'G#m',
                frets: 4,
                strings: 3,
            },
            {
                chord: 'Fm',
                frets: 4,
                strings: 2,
            },
            {
                chord: 'Gm',
                frets: 5,
                strings: 2,
            },
            {
                chord: 'G#m',
                frets: 8,
                strings: 4,
            },
        ],
    },
    {
        id: 'minor-triad-I-inv',
        shapes: [
            {
                chord: 'D#m',
                frets: 2,
                strings: 3,
            },
            {
                chord: 'D#m',
                frets: 6,
                strings: 2,
            },
            {
                chord: 'Dm',
                frets: 5,
                strings: 2,
            },
        ]
    },
    {
        id: 'minor-triad-II-inv',
        shapes: [
            {
                chord: 'Cm',
                frets: 4,
                strings: 3,
            },
            {
                chord: 'A#m',
                frets: 4,
                strings: 2,
            },
            {
                chord: 'A#m',
                frets: 6,
                strings: 2,
            },
        ],
    },
    {
        id: 'major-triad',
        shapes: [
            {
                chord: 'F#',
                frets: 4,
                strings: 2,
            },
            {
                chord: 'F',
                frets: 5,
                strings: 2,
            },
            {
                chord: 'G#',
                frets: 4,
                strings: 3,
            },
            {
                chord: 'G#',
                frets: 8,
                strings: 4,
            },
        ],
    },
    {
        id: 'major-triad-I-inv',
        shapes: [
            {
                chord: 'C#',
                frets: 4,
                strings: 2,
            },
            {
                chord: 'D#',
                frets: 6,
                strings: 2,
            },
            {
                chord: 'D#',
                frets: 4,
                strings: 3,
            },
        ],
    },
    {
        id: 'major-triad-II-inv',
        shapes: [
            {
                chord: 'A#',
                frets: 5,
                strings: 2,
            },
            {
                chord: 'A#',
                frets: 6,
                strings: 2,
            },
            {
                chord: 'B',
                frets: 2,
                strings: 3,
            },
        ],
    },
    {
        id: 'm7_maj7_7',
        shapes: [
            {
                chord: 'G#m7',
                frets: 8,
                strings: 4,
            },
            {
                chord: 'G#maj7',
                frets: 8,
                strings: 4,
            },
            {
                chord: 'G#7',
                frets: 8,
                strings: 4,
            },
        ],
    },
    {
        id: 'm7b5_dim7_aug',
        shapes: [
            {
                chord: 'Fm7b5',
                frets: 13,
                strings: 4,
            },
            {
                chord: 'Fdim7',
                frets: 13,
                strings: 4,
            },
            {
                chord: 'F+',
                frets: 13,
                strings: 4,
            },
        ],
    },
    {
        id: 'sus2_sus4',
        shapes: [
            {
                chord: 'Fsus2',
                frets: 13,
                strings: 4,
            },
            {
                chord: 'Fsus4',
                frets: 13,
                strings: 4,
            },
        ],
    },
];

export const FretboardShapesBox: React.FunctionComponent = observer(() => {
    return (
        <div style={{display: 'flex', flexWrap: 'wrap'}}>
            {
                shapes.map(shape => {
                    return (
                        <div key={shape.id} style={{ padding: '.5em' }}>
                            <div>{shape.id}</div>

                            {
                                shape.shapes
                                    ?
                                    <div>
                                        {
                                            shape.shapes.map((s, i) => {
                                                return (
                                                    <FretboardShape key={i} shape={s} />
                                                )
                                            })
                                        }
                                    </div>
                                    :
                                    <div id="fretboard-shapes-box_${shape.id}"></div>
                            }
                        </div>
                    );
                })
            }
        </div>
    );
});

const guitarScale = (a: number) => a * 1.5;
const FretboardShape: React.FC<{shape: Shape}> = ({shape}) => {
    const strings = shape.strings || 3;
    const [fb] = React.useState(new Fretboard({
        FretboardTemplate: FretboardTemplateShapes.FretboardTemplate,
        NoteMarkTemplate: FretboardTemplateShapes.NoteMarkTemplate,
        frets: shape.frets,
        // startingFret: s.startingFret,
        strings: ['E', 'A', 'D', 'G', 'B', 'E'].slice(0, strings),
        stringsSize: [guitarScale(2), guitarScale((6 - (strings - 1)) / 3)],
        firstFretAreaWidth: guitarScale(35 / 3),
        stringAreaHeight: guitarScale(10),
        fretWidth: guitarScale(1),
    }));

    React.useEffect(() => {
        const notes = (() => {
            if (isScaleShape(shape))
                return Tonal.Scale.get(shape.scale).notes;
            else if (isChordShape(shape))
                return Tonal.Chord.get(shape.chord).notes;
            else
                throw new Error('unknown scale shape');
        })();

        fb.showNotes(notes);
    }, []);

    return (
        <div style={{ marginBottom: '.5em' }}>
            <div id="fretboard-shapes-box_${shape.id}_${i}"></div>
            <FretboardBlock model={fb} />
        </div>
    );
};

// class FretboardShapesBoxModel {
//     render(el) {


//         this.root = el;
//         el.innerHTML = FretboardShapesBoxTemplate(shapes);

//         const renderShape = (id, shape, i) => {


//             const guitarScale = (a) => a * 1.5;
//             const strings = shape.strings || 3;
//             const fretboard = new Fretboard({
//                 FretboardTemplate: window.FretboardTemplateShapes.FretboardTemplate,
//                 NoteMarkTemplate: window.FretboardTemplateShapes.NoteMarkTemplate,
//                 frets: shape.frets,
//                 startingFret: shape.startingFret,
//                 strings: ['E', 'A', 'D', 'G', 'B', 'E'].slice(0, strings),
//                 stringsSize: [guitarScale(2), guitarScale((6 - (strings - 1)) / 3)],
//                 firstFretAreaWidth: guitarScale(35 / 3),
//                 stringAreaHeight: guitarScale(10),
//                 fretWidth: guitarScale(1),
//             });
//             fretboard.render(document.getElementById(`fretboard-shapes-box_${id}${typeof i === 'number' ? `_${i}` : ''}`))
//             fretboard.showNotes(notes);
//         };

//         shapes.forEach(shape => {
//             if (shape.shapes) {
//                 shape.shapes.forEach((s, i) => renderShape(shape.id, s, i));
//             }
//             else {
//                 renderShape(shape.id, shape);
//             }
//         });
//     }
// }