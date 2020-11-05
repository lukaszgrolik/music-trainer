(() => {

    const FretboardShapesBoxTemplate = (shapes) => {
        return `<div style="display: flex; flex-wrap: wrap;">
            ${
                shapes.map(shape => {
                    return `<div style="padding: .5em">
                        ${shape.id}

                        ${
                            shape.shapes
                            ?
                            `<div>
                                ${
                                    shape.shapes.map((s, i) => {
                                        return `<div style="margin-bottom: .5em;">
                                            <div id="fretboard-shapes-box_${shape.id}_${i}"></div>
                                        </div>`;
                                    }).join('')
                                }
                            </div>`
                            :
                            `<div id="fretboard-shapes-box_${shape.id}"></div>`
                        }
                    </div>`
                }).join('')
            }
        </div>`
    };

    class FretboardShapesBox {
        render(el) {
            const shapes = [
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

            this.root = el;
            el.innerHTML = FretboardShapesBoxTemplate(shapes);

            const renderShape = (id, shape, i) => {
                const notes = (() => {
                    if (shape.scale) {
                        return Tonal.Scale.get(shape.scale).notes;
                    }
                    else if (shape.chord) {
                        return Tonal.Chord.get(shape.chord).notes;
                    }
                    else if (shape.notes) {
                        return shape.notes;
                    }
                })();

                const guitarScale = (a) => a * 1.5;
                const strings = shape.strings || 3;
                const fretboard = new Fretboard({
                    FretboardTemplate: window.FretboardTemplateShapes.FretboardTemplate,
                    NoteMarkTemplate: window.FretboardTemplateShapes.NoteMarkTemplate,
                    frets: shape.frets,
                    startingFret: shape.startingFret,
                    strings: ['E', 'A', 'D', 'G', 'B', 'E'].slice(0, strings),
                    stringsSize: [guitarScale(2), guitarScale((6 - (strings - 1)) / 3)],
                    firstFretAreaWidth: guitarScale(35 / 3),
                    stringAreaHeight: guitarScale(10),
                    fretWidth: guitarScale(1),
                });
                fretboard.render(document.getElementById(`fretboard-shapes-box_${id}${typeof i === 'number' ? `_${i}` : ''}`))
                fretboard.showNotes(notes);
            };

            shapes.forEach(shape => {
                if (shape.shapes) {
                    shape.shapes.forEach((s, i) => renderShape(shape.id, s, i));
                }
                else {
                    renderShape(shape.id, shape);
                }
            });
        }
    }

    window.FretboardShapesBox = FretboardShapesBox;

})();