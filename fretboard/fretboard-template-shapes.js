(() => {

    function FretTemplate(fretboard, fret, customStyle) {
        const style = {
            // 'background-color': i === 0 ? 'Sienna' : '#777',
            // 'background-color': '#777',
            'background-color': '#ddd',
            position: 'absolute',
            left: `${fret.pos + fret.width - fretboard.opts.fretWidth / 2}px`,
            bottom: '0px',
            // width: `${fretboard.opts.fretWidth}px`,
            width: `1px`,
            height: `${fretboard.totalHeight}px`,
        };

        // Object.assign(style, customStyle);

        return `<div style="${styleString(style)}"></div>`
    }

    function FretboardTemplate(fretboard) {
        const fretsCount = fretboard.frets.length;

        return `<div data-fretboard style="position: relative; width: ${fretboard.totalWidth}px; height: ${fretboard.totalHeight}px; line-height: 1; font-family: sans-serif; background-color: #eee">
            ${
                new Array(fretsCount * fretboard.opts.strings.length).fill().map((_, i) => {
                    const fretIndex = Math.floor(i / fretboard.opts.strings.length);
                    const fret = fretboard.frets[fretIndex];
                    const stringIndex = i % fretboard.opts.strings.length;
                    const posY = fretboard.opts.stringAreaHeight * stringIndex;
                    const color = (() => {
                        if ([3, 5, 7, 9, 15, 17, 19, 21, 22].map(f => f - 1).includes(fretIndex)) {
                            return '#eee'
                        }
                        else if ([12, 24].map(f => f - 1).includes(fretIndex)) {
                            return '#ddd';
                        }

                        return '#f7f7f7'
                    })();

                    const style = {
                        // ...(color && { 'background-color': color }),
                        'position': 'absolute',
                        'left': `${fret.pos}px`,
                        'bottom': `${posY}px`,
                        'width': `${fret.width}px`,
                        'height': `${fretboard.opts.stringAreaHeight}px`,
                        'display': 'flex',
                        'justify-content': 'center',
                        'align-items': 'center',
                    };

                    return `<div data-string="${stringIndex}" data-fret="${fretIndex}" style="${styleString(style)}"></div>`;
                }).join('')
            }

            <div>
                <!--${FretTemplate(fretboard, { pos: 0, width: 0 }, { 'background-color': 'Sienna' })}-->

                ${
                    fretboard.frets.map((fret, i) => {
                        if (i === fretboard.frets.length - 1) return '';
                        return FretTemplate(fretboard, fret);
                    }).join('')
                }
            </div>

            <!--
            ${
                fretboard.opts.strings.map((s, i) => {
                    const lerp = (a, b, t) => a + (b - a) * t;

                    const stringsCount = fretboard.opts.strings.length;
                    const posY = fretboard.opts.stringAreaHeight * (i % stringsCount) + fretboard.opts.stringAreaHeight / 2;
                    const stringSize = lerp(fretboard.opts.stringsSize[0], fretboard.opts.stringsSize[1], i / (stringsCount - 1));
                    const style = {
                        'background-color': 'LightGray',
                        'position': 'absolute',
                        'left': `${- fretboard.opts.fretWidth / 2}px`,
                        'bottom': `${posY - stringSize / 2}px`,
                        'width': `${fretboard.totalWidth + fretboard.opts.fretWidth}px`,
                        'height': `${stringSize}px`,
                    };

                    return `<div style="${styleString(style)}"></div>`;
                }).join('')
            }
            -->

            <div data-fretboard-note-marks style="position: absolute; left: 0px; width: ${fretboard.totalWidth}px; height: ${fretboard.totalHeight}px;"></div>
        </div>`
    }

    const NoteMarkTemplate = ({ fretboard, chroma, rootChroma, note, isRoot, string, fret }) => {
        const posY = fretboard.opts.stringAreaHeight * string;
        const wrapperStyle = {
            'box-sizing': 'border-box',
            'position': 'absolute',
            'left': `${fret.pos}px`,
            'bottom': `${posY}px`,
            'width': `${fret.width}px`,
            'height': `${fretboard.opts.stringAreaHeight}px`,
            'display': 'flex',
            'justify-content': 'center',
            'align-items': 'center',
        };
        const interval = (12 + chroma - rootChroma) % 12;
        const color = `hsl(${360 / 12 * interval}, 50%, 50%)`;
        const iconStyle = {
            // 'background-color': isRoot ? '#000' : 'transparent',
            'background-color': isRoot ? color : 'transparent',
            'color': 'white',
            'font-weight': 'bold',
            'border-radius': '100%',
            // ...(![0, 3, 4, 7].includes(interval) && {'border-radius': '100%'}),
            // ...([10, 11].includes(interval) && {'border-radius': '20%'}),
            'width': `${fretboard.opts.stringAreaHeight * .8}px`,
            'height': `${fretboard.opts.stringAreaHeight * .8}px`,
            'display': 'flex',
            'justify-content': 'center',
            'align-items': 'center',
            'box-sizing': 'border-box',
            // 'border': '2px solid black',
            'border': `2px solid ${color}`,
            // ...(isRoot && { border: '2px solid black' }),
            'flex-shrink': 0,
        };

        return `<div data-mark-string="${string}" style="${styleString(wrapperStyle)}">
            <div style="${styleString(iconStyle)}">
                <!--${note}-->
            </div>
        </div>`;
    }

    window.FretboardTemplateShapes = {
        FretboardTemplate,
        NoteMarkTemplate,
    };

})();