const whiteKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
const blackKeys = [['C#', 'D#'], ['F#', 'G#', 'A#']];
const allNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function styleString(style: {[key: string]: string}) {
    return Object.entries(style).map(([prop, val]) => {
        return `${prop}: ${style[prop]}`;
    }).join('; ');
}

function chroma(note: string) {
    const letters = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
    const letter = note.slice(0, 1).toLowerCase() as keyof typeof letters;
    const acc = note.slice(1);

    if (!letters.hasOwnProperty(letter)) throw new Error('invalid note letter');
    let res = letters[letter];

    for (let i = 0; i < acc.length; ++i) {
        if (acc[i] === 'b') {
            res -= 1;
            if (res < 0) res += 12;
        }
        else if (acc[i] === '#') {
            res += 1;
            if (res > 11) res -= 12;
        }
    }

    return res;
}

const KeyboardBlock = (keyboard: Keyboard) => {
    return `<div class="keyboard" style="background-color: #222; display: inline-flex; padding: ${keyboard.whiteKeyMargin}px; line-height: 1; font-family: sans-serif;">
        ${
            new Array(keyboard.opts.octaves).fill(undefined).map((_, i) => {
                return OctaveKeyboardBlock(keyboard, i !== keyboard.opts.octaves - 1);
            }).join('')
        }
    </div>`
}

const OctaveKeyboardBlock = (keyboard: Keyboard, hasMargin: boolean) => {
    // const width = (whiteKeyWidth + whiteKeyMargin) * whiteKeys.length - whiteKeyMargin;
    const width = keyboard.whiteKeyWidth * whiteKeys.length + keyboard.whiteKeyMargin * (whiteKeys.length - 1);

    const octaveKeyboardStyle = {
        'width': `${width}px`,
        'height': `${keyboard.opts.whiteKeyHeight * keyboard.opts.keySizeMultiplier}px`,
        'position': 'relative',
    };

    return `<div class="octave-keyboard-wrapper" style="${hasMargin ? `margin-right: ${keyboard.whiteKeyMargin}px` : ''}">
        <div class="octave-keyboard" style="${styleString(octaveKeyboardStyle)}">
            ${
                whiteKeys.map((note, i) => {
                    const style = {
                        'background-color': 'white',
                        'display': 'flex',
                        'justify-content': 'center',
                        'width': `${keyboard.opts.whiteKeyWidth * keyboard.opts.keySizeMultiplier}px`,
                        'height': `${keyboard.opts.whiteKeyHeight * keyboard.opts.keySizeMultiplier}px`,
                        'position': 'absolute',
                        'left': `${(keyboard.whiteKeyWidth + keyboard.whiteKeyMargin) * i}px`,
                        'top': '0',
                    }

                    return `<div class="octave-keyboard-white-key" style="${styleString(style)}"></div>`
                }).join('')
            }

            ${
                blackKeys.map((group, i) => {
                    const style = {
                        position: 'absolute',
                        top: '0',
                        left: `${keyboard.blackKeysGrops[i].marginLeft}`,
                    };

                    return `<div class="octave-keyboard-black-key-group" style="${styleString(style)}">
                        ${
                            group.map((key, i) => {
                                const style = {
                                    'background': 'linear-gradient(#555 90%, #444 90%, #444 95%, #333 95%)',
                                    'display': 'flex',
                                    'justify-content': 'center',
                                    'width': `${keyboard.opts.blackKeyWidth * keyboard.opts.keySizeMultiplier}px`,
                                    'height': `${keyboard.opts.blackKeyHeight * keyboard.opts.keySizeMultiplier}px`,
                                    'position': 'absolute',
                                    'top': '0',
                                    'left': `${(keyboard.blackKeyWidth + keyboard.blackKeyMargin) * i}px`,
                                    'box-sizing': 'border-box',
                                    'border-width': `0 ${keyboard.whiteKeyMargin}px ${keyboard.whiteKeyMargin}px ${keyboard.whiteKeyMargin}px`,
                                    'border-style': 'solid',
                                    'border-color': '#222',
                                }

                                return `<div class="octave-keyboard-black-key" style="${styleString(style)}"></div>`
                            }).join('')
                        }
                    </div>`
                }).join('')
            }
        </div>
    </div>`;
}

const noteMark = (note: string, chroma: number, rootChroma: number, isRoot: boolean) => {
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
        ...(![0, 3, 4, 7].includes(interval) && {'border-radius': '100%'}),
        ...([10, 11].includes(interval) && {'border-radius': '20%'}),
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

interface KeyboardOpts {
    octaves: number;
    whiteKeyWidth: number;
    whiteKeyHeight: number;
    blackKeyWidth: number;
    blackKeyHeight: number;
    whiteKeyMargin: number;
    keySizeMultiplier: number;
}

interface BlackKeyGroup {
    marginLeft: string;
}

// @todo colorize notes (tonic/subdominant/dominant)
export class Keyboard {
    root?: HTMLElement;

    readonly whiteKeyWidth: number;
    readonly blackKeyWidth: number;
    readonly whiteKeyMargin: number;
    readonly blackKeyMargin: number;
    readonly blackKeysGrops: [BlackKeyGroup, BlackKeyGroup];

    constructor(readonly opts: KeyboardOpts) {
        this.whiteKeyWidth = opts.whiteKeyWidth * opts.keySizeMultiplier;
        this.blackKeyWidth = opts.blackKeyWidth * opts.keySizeMultiplier;

        this.whiteKeyMargin = opts.whiteKeyMargin;
        this.blackKeyMargin = 27 / 5 * this.whiteKeyMargin;

        this.blackKeysGrops = [
            { marginLeft: `${this.whiteKeyWidth * 2 / 3}px` },
            { marginLeft: `${this.whiteKeyWidth * 3.925}px` },
        ];
    }

    render(el: HTMLElement) {
        this.root = el;
        el.innerHTML = KeyboardBlock(this);
    }

    showNotes(notes: string[]) {
        if (!this.root) throw new Error('no root element found');

        const chromas = notes.map(chroma);

        Array.from(this.root.querySelectorAll('.octave-keyboard-white-key')).forEach((keyEl, i) => {
            keyEl.innerHTML = '';
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
            keyEl.innerHTML = '';
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
