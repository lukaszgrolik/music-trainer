(() => {
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

    const ProgressionsBlockTemplate = () => {
        const keys = ['A', 'C', 'D', 'E', 'G'];
        const progressions = [
            ['Im', 'IVm', 'Vm'],
            ['Im', 'IVm', 'bVI', 'V7'],
            ['I', 'IV', 'V'],
            ['I', 'IV', 'V'],
            // minor plagal cadence
            {name: 'minor plagal cadence', chords: ['I', 'IVm', 'I'], info: 'iv-I instead of IV-I'},
            {name: 'minor plagal cadence', chords: ['I', 'IV', 'IVm', 'I'], info: 'iv-I instead of IV-I'},
            ...[
                // minor
                ['i', 'bVII', 'bVI'],
                ['bVI', 'i', 'bVII', 'i'],
                ['i', 'bVII', 'bVI', 'bVII'],
                ['i', 'bVI', 'bIII', 'bVII'],
                {chords: ['i', 'bVI', 'iv', 'V'], name: '', info: 'V instead of v'},
                {chords: ['i', 'bVI', 'iv', 'V7'], name: '', info: 'V7 instead of Vm7'},
                {chords: ['i', 'bVII', 'bVI', 'V7'], name: 'andalusian cadence'},
                ['i', 'bIII', 'iv', 'bVI'],
                ['i', 'bIII', 'bVI', 'V7'],
                ['iiø', 'V7', 'i'],
                // harmonic minor
                {chords: ['iiø', 'V', 'i'], name: '', info: 'neoclassical, medieval'},
                ['i', 'V', 'bVI', 'iv'],
                ['i', 'bVI', 'iiø', 'V'],
            ],
        ];

        const style = {
            'font-family': 'Consolas, monospace',
            // 'font-size': '1.2em',
            'line-height': '1',
        };

        return `<div style="${styleString(style)}">
            ${
                randomSamples(progressions, 3).map(prog => {
                    const key = randomSample(keys);
                    const getChords = prog => prog instanceof Array ? prog : prog.chords;
                    const chords = getChords(prog);
                    const transformChord = chord => {
                        return chord
                            .replace(/([i,v]+)$/, (_, g) => {
                                return g + 'm';
                            })
                            .replace(/([i,v]+)/, (_, g) => {
                                return g.toUpperCase();
                            });
                    };
                    const tonalChords = Tonal.Progression.fromRomanNumerals(key, chords.map(transformChord));
                    const sharedScales = intersection(
                        ...tonalChords.map(chord => {
                            return Tonal.Chord.chordScales(chord);
                        })
                    );
                    const style = {
                        border: '1px solid #ddd',
                        padding: '.5em',
                        'margin-bottom': '.5em',
                    };

                    return `<div style="${styleString(style)}">
                        <div>
                            <div style="font-weight: bold">${key} - ${chords.join('-')} (${tonalChords.join('-')})</div>
                            <div>${prog.name || 'unnamed'}${prog.info ? ` | ${prog.info}` : ''}</div>
                            <div style="font-size: .8em">
                                ${
                                    sharedScales.filter(s => visibleScales.includes(s)).map(s => {
                                        return `<span style="border-bottom: 1px solid #ccc;">${s}</span>`;
                                    }).join(', ')
                                }
                            </div>
                        </div>

                        <table>
                            <tr>
                                ${
                                    tonalChords.map((chord, i) => {
                                        return `<th>${chords[i]} - ${chord}</th>`;
                                    }).join('')
                                }
                            </tr>

                            <tr>
                                ${
                                    tonalChords.map((chord, i) => {
                                        return `<td>
                                            <!--<div>piano chord, fretboard chord</div>-->
                                            <div style="font-size: .8em">
                                                ${
                                                    Tonal.Chord.chordScales(chord).filter(s => visibleScales.includes(s)).map(s => {
                                                        return `<span style="border-bottom: 1px solid #ccc;">${s}</span>`;
                                                    }).join(', ')
                                                }
                                            </div>
                                        </td>`;
                                    }).join('')
                                }
                            </tr>
                        </table>
                    </div>`;
                }).join('')
            }
        </div>`
    }

    class ProgressionsBlock {
        constructor(store) {
            this.store = store;
        }

        render(el) {
            this.root = el;
            el.innerHTML = ProgressionsBlockTemplate();
        }

        update() {
            this.root.innerHTML = ProgressionsBlockTemplate();
        }
    }

    window.ProgressionsBlock = ProgressionsBlock;

})();
