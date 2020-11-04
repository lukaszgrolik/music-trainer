(() => {

    const ChordsTableTemplate = (scale) => {
        const data = Tonal.Scale.modeNames(scale).map(m => {
            const scaleName = m.join(' ');
            return [scaleName, Tonal.Scale.scaleChords(scaleName)];
        });

        const style = {
            'font-family': 'monospace',
            'font-size': '1.2em',
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

                ${data.map((mode, i) => {
            const [_, noteName, modeName] = mode[0].match('^([A-G][b#]{0,2}) (.+)$');

            return `<tr>
                            <td>#${i + 1}</td>
                            <th>${noteName}</th>
                            <th>${modeName}</th>
                            <td>
                                ${mode[1].map(chord => {
                const important1 = ['M', 'm', '7', 'maj7', 'm7'].includes(chord);
                const important2 = ['dim', 'm7b5', 'dim7', 'aug'].includes(chord);
                const important3 = ['sus2', 'sus4'].includes(chord);
                const style = {
                    ...((important1 || important2 || important3) ? {
                        'font-weight': 'bold',
                    } : {
                            color: 'grey'
                        }),
                    ...(important1 && {
                        background: 'khaki',
                    }),
                    ...(important2 && {
                        background: 'silver',
                    }),
                    ...(important3 && {
                        background: 'lightskyblue',
                    }),
                };

                return `<span style="${styleString(style)}">${chord}</span>`
            }).join(', ')
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
