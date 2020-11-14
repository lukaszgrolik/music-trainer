export * as FretboardTemplateFull from './fretboard-template-full';
export * as FretboardTemplateShapes from './fretboard-template-shapes';

const allNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
// const whiteKeys = allNotes.filter(n => !n.includes('#'));

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

export interface FretboardFret {
    width: number;
    pos: number;
}

export interface FretboardNoteMarkTemplateParams {
    fretboard: Fretboard;
    chroma: number;
    rootChroma: number;
    note: string;
    isRoot?: boolean;
    string: number;
    fret: FretboardFret;
    isActive: boolean;
}

interface FretboardOpts {
    FretboardTemplate: (fretboard: Fretboard) => string;
    NoteMarkTemplate: (params: FretboardNoteMarkTemplateParams) => string;
    frets: number;
    // startingFret: number;
    strings: string[];
    stringsSize: [number, number];
    firstFretAreaWidth: number;
    stringAreaHeight: number;
    fretWidth: number;
}

// @todo colorize notes by function (tonic/subdominant/dominant), octave
// fret numbers below
// 0 fret notes on the left
export class Fretboard {
    notes: number[][];
    totalHeight: number;
    frets: FretboardFret[]
    zeroFretWidth: number;
    totalWidth: number;

    root?: HTMLElement;

    constructor(readonly opts: FretboardOpts) {
        // const fretsFragmentCount = opts.startingFret + opts.frets;
        const fretsFragmentCount = opts.frets;

        // notes for all frets + 0th fret
        this.notes = this.opts.strings.map(s => {
            // const firstNoteIndex = allNotes.indexOf(s);
            // return new Array(this.opts.frets + 1).fill().map((_, i) => {
            return new Array(fretsFragmentCount + 1).fill(undefined).map((_, i) => {
                // return allNotes[(firstNoteIndex + i) % allNotes.length];
                return (chroma(s) + i) % 12;
            });
            // .slice(opts.startingFret);
        });

        this.totalHeight = this.opts.stringAreaHeight * opts.strings.length;
        // this.frets = new Array(opts.frets).fill().reduce((memo, _, i) => {
        this.frets = new Array(fretsFragmentCount).fill(undefined).reduce((memo, _, i) => {
            if (i === fretsFragmentCount - 1) return memo;

            const width = memo[i].width / (2 ** (1 / 12));
            const d = {
                width,
                pos: memo[i].pos + memo[i].width,
            };
            memo.push(d);

            return memo;
        }, [{ width: this.opts.firstFretAreaWidth, pos: 0 }])
        // .slice(opts.startingFret);

        this.zeroFretWidth = this.opts.stringAreaHeight * 2;

        const lastFret = this.frets[this.frets.length - 1];
        this.totalWidth = lastFret.pos + lastFret.width;
        // this.totalWidth = lastFret.pos + lastFret.width - this.frets[0].pos;
    }

    render(el: HTMLElement) {
        this.root = el;
        el.innerHTML = this.opts.FretboardTemplate(this);
    }

    showNotes(notes: string[]) {
        if (!this.root) throw new Error('root element not found');

        // notes = sanitizeNotes(notes);
        const chromas = notes.map(chroma);

        const container = this.root.querySelector('[data-fretboard]');
        const noteMarksContainer = this.root.querySelector('[data-fretboard-note-marks]');
        if (!noteMarksContainer) throw new Error('marks container not found');

        // this.onShowNotes(container, notes, chromas);

        // noteMarksContainer.querySelectorAll('[data-mark-string]').forEach(el => el.remove());
        noteMarksContainer.innerHTML = '';

        Array.from(this.root.querySelectorAll('[data-string]')).forEach(el => {
            const dataString = el.getAttribute('data-string')
            if (!dataString) throw new Error('data-string attribute not found');
            const stringIndex = parseInt(dataString);

            const dataFret = el.getAttribute('data-fret')
            if (!dataFret) throw new Error('data-fret attribute not found');
            const fretIndex = parseInt(dataFret);

            const string = this.notes[stringIndex];
            const chroma = string[fretIndex + 1];

            // if (chromas.includes(note)) {
            const chromaIndex = chromas.indexOf(chroma);
            if (chromaIndex !== -1) {
                const isRoot = chromaIndex === 0;
                // el.innerHTML = NoteMarkTemplate(note, isRoot);
                const note = notes[chromaIndex];
                const markEl = this.opts.NoteMarkTemplate({
                    fretboard: this,
                    chroma,
                    rootChroma: chromas[0],
                    note,
                    isRoot,
                    string: stringIndex,
                    fret: this.frets[fretIndex],
                    isActive: true,
                });
                noteMarksContainer.innerHTML += markEl;
            }
            else {
                el.innerHTML = '';
            }
        });

        const zeroFretNoteMarksContainer = this.root.querySelector('[data-zero-fret-note-marks]');

        if (zeroFretNoteMarksContainer) {
            zeroFretNoteMarksContainer.innerHTML = '';

            this.opts.strings.forEach((string, i) => {
                const noteChroma = chroma(string);
                zeroFretNoteMarksContainer.innerHTML += this.opts.NoteMarkTemplate({
                    fretboard: this,
                    chroma: noteChroma,
                    rootChroma: chromas[0],
                    note: string,
                    // isRoot,
                    string: i,
                    fret: { pos: 0, width: this.zeroFretWidth },
                    isActive: chromas.includes(noteChroma),
                });
            });
        }
    }
}