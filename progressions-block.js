(() => {

    const ProgressionsBlockTemplate = () => {
        const keys = ['A'];
        const progressions = [
            ['Im', 'IVm', 'Vm'],
            ['Im', 'IVm', 'bVI', 'V7'],
            ['I', 'IV', 'V'],
            ['I', 'IVm', 'I'],
            ['I', 'IV', 'IVm', 'I'],
        ];

        const style = {
            'font-family': 'Consolas, monospace',
            // 'font-size': '1.2em',
            'line-height': '1',
        };

        return `<div style="${styleString(style)}">
            ${
                progressions.map(prog => {
                    const chords = Tonal.Progression.fromRomanNumerals(keys[0], prog);

                    return `<div>
                        <table>
                            <tr>
                                ${
                                    chords.map((chord, i) => {
                                        return `<th>${prog[i]} - ${chord}</th>`;
                                    }).join('')
                                }
                            </tr>

                            <tr>
                                ${
                                    chords.map((chord, i) => {
                                        return `<td>piano chord, fretboard chord, matching scales</td>`;
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
