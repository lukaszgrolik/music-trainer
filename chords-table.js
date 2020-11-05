(() => {

    const ChordsTableTemplate = (scale) => {
        const data = Tonal.Scale.modeNames(scale).map(m => {
            const scaleName = m.join(' ');
            return [scaleName, Tonal.Scale.scaleChords(scaleName)];
        });

        const style = {
            'font-family': 'Consolas, monospace',
            // 'font-size': '1.2em',
            'line-height': '1',
        };

        return `<div style="${styleString(style)}">
            <table>
                <tr>
                    <th></th>
                    <th>note</th>
                    <th>mode</th>
                    <th>chords</th>
                </tr>

                ${
                    data.map((mode, i) => {
                        const [_, noteName, modeName] = mode[0].match('^([A-G][b#]{0,2}) (.+)$');
                        const sortOrder = ['M', 'm', 'maj7', 'm7', '7', 'dim', 'm7b5', 'dim7', 'aug', 'sus2', 'sus4'];

                        return `<tr>
                            <td>#${i + 1}</td>
                            <th>${noteName}</th>
                            <th>${modeName}</th>
                            <td>
                                ${
                                    mode[1]
                                    .sort((a, b) => {
                                        const x = i => i === -1 ? 999 : i;

                                        return x(sortOrder.indexOf(a)) - x(sortOrder.indexOf(b));
                                    })
                                    .map(chord => {
                                        // const important1 = ['M', 'm', '7', 'maj7', 'm7'].includes(chord);
                                        // const important2 = ['dim', 'm7b5', 'dim7', 'aug'].includes(chord);
                                        // const important3 = ['sus2', 'sus4'].includes(chord);
                                        const colors = {
                                            [`hsl(${360 / 12 * 3}, 50%, 50%)`]: ['m', 'm7'],
                                            [`hsl(${360 / 12 * 4}, 50%, 50%)`]: ['M', 'maj7', '7'],
                                            [`hsl(${360 / 12 * 6}, 50%, 50%)`]: ['dim', 'm7b5', 'dim7'],
                                            [`hsl(${360 / 12 * 8}, 50%, 50%)`]: ['aug'],
                                            [`hsl(${360 / 12 * 2}, 50%, 50%)`]: ['sus2'],
                                            [`hsl(${360 / 12 * 5}, 50%, 50%)`]: ['sus4'],
                                        };
                                        const style = {
                                            // ...((important1 || important2 || important3) ? {
                                            padding: '.1em .25em',
                                            display: 'inline-block',
                                            'box-sizing': 'border-box',
                                            'margin-right': '.5em',
                                            ...(Object.values(colors).flat().includes(chord) ? {
                                                color: '#fff',
                                                // 'font-weight': 'bold',
                                            } : {
                                                color: 'grey',
                                                border: '1px solid lightgrey',
                                            }),

                                            // ...(important1 && {
                                            //     background: 'khaki',
                                            // }),
                                            // ...(important2 && {
                                            //     background: 'silver',
                                            // }),
                                            // ...(important3 && {
                                            //     background: 'lightskyblue',
                                            // }),
                                        };

                                        if (chord.includes('7')) {
                                            const intervals = {
                                                'maj7': 11,
                                                'm7': 10,
                                                'm7b5': 10,
                                                '7': 10,
                                                'dim7': 9,
                                            };

                                            style['border-left'] = `.5em solid ${`hsl(${360 / 12 * intervals[chord]}, 50%, 50%)`}`;
                                        }

                                        for (const c in colors) {
                                            if (colors[c].includes(chord)) {
                                                style['background-color'] = c;
                                                break;
                                            }
                                        }

                                        return `<span style="${styleString(style)}">${chord}</span>`
                                    }).join('')
                                }
                            </td>
                        </tr>`;
                    }).join('')
                }
            </table>
        </div>`
    }

    class ChordsTable {
        constructor(store) {
            this.store = store;
        }

        render(el) {
            this.root = el;
            el.innerHTML = ChordsTableTemplate(this.store.scaleName);
        }

        update() {
            this.root.innerHTML = ChordsTableTemplate(this.store.scaleName);
        }
    }

    window.ChordsTable = ChordsTable;

})();
