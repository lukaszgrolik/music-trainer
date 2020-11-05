(() => {
    const whiteKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
    const blackKeys = [['C#', 'D#'], ['F#', 'G#', 'A#']];
    const allNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

    const computedStyle = getComputedStyle(document.body);
    const whiteKeyBaseWidth = parseInt(computedStyle.getPropertyValue('--white-key-width'));
    const blackKeyBaseWidth = parseInt(computedStyle.getPropertyValue('--black-key-width'));

    const keySizeMultiplier = parseInt(computedStyle.getPropertyValue('--key-size-multiplier'));

    const whiteKeyWidth = whiteKeyBaseWidth * keySizeMultiplier;
    const blackKeyWidth = blackKeyBaseWidth * keySizeMultiplier;

    const whiteKeyMargin = 5;
    const blackKeyMargin = 27;

    const blackKeysGrops = [
        { marginLeft: `${whiteKeyWidth * 2 / 3}px` },
        { marginLeft: `${whiteKeyWidth * 3.925}px` },
    ];

    const keyboard = (octaves) => {
        return `<div class="keyboard" style="background-color: #222; display: inline-flex; padding: 5px; line-height: 1; font-family: sans-serif;">
            ${
                new Array(octaves).fill().map((_, i) => {
                    return octaveKeyboard(i !== octaves - 1);
                }).join('')
            }
        </div>`
    }

    const octaveKeyboard = (hasMargin) => {
        // const width = (whiteKeyWidth + whiteKeyMargin) * whiteKeys.length - whiteKeyMargin;
        const width = whiteKeyWidth * whiteKeys.length + whiteKeyMargin * (whiteKeys.length - 1);

        return `<div class="octave-keyboard-wrapper" style="${hasMargin ? 'margin-right: 5px' : ''}">
            <div class="octave-keyboard" style="width: ${width}px">
                ${
                    whiteKeys.map((note, i) => {
                         return `<div class="octave-keyboard-white-key" style="left: ${(whiteKeyWidth + whiteKeyMargin) * i}px; display: flex; justify-content: center;"></div>`
                    }).join('')
                }

                ${
                    blackKeys.map((group, i) => {
                        return `<div class="octave-keyboard-black-key-group" style="left: ${blackKeysGrops[i].marginLeft}">
                            ${
                                group.map((key, i) => {
                                    return `<div class="octave-keyboard-black-key" style="left: ${(blackKeyWidth + blackKeyMargin) * i}px; display: flex; justify-content: center;"></div>`
                                }).join('')
                            }
                        </div>`
                    }).join('')
                }
            </div>
        </div>`;
    }

    const noteMark = (note, chroma, rootChroma, isRoot) => {
        // position: absolute; bottom: 25px; text-align: center; width: 1.5em; height: 1.5em; border-radius: 100%; background-color: khaki
        const interval = (12 + chroma - rootChroma) % 12;
        const color = `hsl(${360 / 12 * interval}, 50%, 50%)`;
        const style = {
            'box-sizing': 'border-box',
            position: 'absolute',
            bottom: '25px',
            'text-align': 'center',
            width: '1.6em',
            height: '1.6em',
            'border-radius': '100%',
            // 'background-color': isRoot ? color : '#fff',
            'background-color': color,
            // 'color': isRoot ? '#fff' : '#000',
            'color': '#fff',
            'font-weight': 'bold',
            display: 'flex',
            'justify-content': 'center',
            'align-items': 'center',
            // border: `2px solid ${color}`,
            ...(isRoot && {border: `2px solid ${color}`}),
        };

        return `<div style="${styleString(style)}">${note}</div>`;
    }

    // @todo colorize notes (tonic/subdominant/dominant)
    class Piano {
        constructor(opts) {
            this.opts = opts;
        }

        render(el) {
            this.root = el;
            el.innerHTML = keyboard(this.opts.octaves);
        }

        showNotes(notes) {
            const chromas = notes.map(chroma);

            Array.from(this.root.querySelectorAll('.octave-keyboard-white-key')).forEach((keyEl, i) => {
                keyEl.innerHTML = null;
                const whiteKeyChromas = whiteKeys.map(chroma);

                // notes.forEach(note => {
                chromas.forEach(noteChroma => {
                    // if (whiteKeys.indexOf(note) === i % whiteKeys.length) {
                    if (whiteKeyChromas.indexOf(noteChroma) === i % whiteKeyChromas.length) {
                        const noteChromaIndex = chromas.indexOf(noteChroma);
                        const isRoot = noteChromaIndex === 0;
                        const note = notes[noteChromaIndex];
                        keyEl.innerHTML = noteMark(note, noteChroma, chromas[0], isRoot);
                    }
                })
            });

            Array.from(this.root.querySelectorAll('.octave-keyboard-black-key')).forEach((keyEl, i) => {
                keyEl.innerHTML = null;
                const blackKeyChromas = blackKeys.flat().map(chroma);

                chromas.forEach(noteChroma => {
                    if (blackKeyChromas.indexOf(noteChroma) === i % blackKeyChromas.length) {
                        const noteChromaIndex = chromas.indexOf(noteChroma);
                        const isRoot = noteChromaIndex === 0;
                        const note = notes[noteChromaIndex];
                        keyEl.innerHTML = noteMark(note, noteChroma, chromas[0], isRoot);
                    }
                })
            });
        }
    }

    window.Piano = Piano;
})();
