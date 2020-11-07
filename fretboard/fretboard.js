(() => {
    const allNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    // const whiteKeys = allNotes.filter(n => !n.includes('#'));

    // @todo colorize notes by function (tonic/subdominant/dominant), octave
    // fret numbers below
    // 0 fret notes on the left
    class Fretboard {
        constructor(opts) {
            this.opts = opts;

            // const fretsFragmentCount = opts.startingFret + opts.frets;
            const fretsFragmentCount = opts.frets;

            // notes for all frets + 0th fret
            this.notes = this.opts.strings.map(s => {
                // const firstNoteIndex = allNotes.indexOf(s);
                // return new Array(this.opts.frets + 1).fill().map((_, i) => {
                return new Array(fretsFragmentCount + 1).fill().map((_, i) => {
                    // return allNotes[(firstNoteIndex + i) % allNotes.length];
                    return (chroma(s) + i) % 12;
                })
                // .slice(opts.startingFret);
            });

            this.totalHeight = this.opts.stringAreaHeight * opts.strings.length;
            // this.frets = new Array(opts.frets).fill().reduce((memo, _, i) => {
            this.frets = new Array(fretsFragmentCount).fill().reduce((memo, _, i) => {
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

        render(el) {
            this.root = el;
            el.innerHTML = this.opts.FretboardTemplate(this);
        }

        showNotes(notes) {
            // notes = sanitizeNotes(notes);
            const chromas = notes.map(chroma);

            const container = this.root.querySelector('[data-fretboard]');
            const noteMarksContainer = this.root.querySelector('[data-fretboard-note-marks]');

            // this.onShowNotes(container, notes, chromas);

            // noteMarksContainer.querySelectorAll('[data-mark-string]').forEach(el => el.remove());
            noteMarksContainer.innerHTML = null;

            Array.from(this.root.querySelectorAll('[data-string]')).forEach(el => {
                const stringIndex = parseInt(el.getAttribute('data-string'));
                const fretIndex = parseInt(el.getAttribute('data-fret'));
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
                    el.innerHTML = null;
                }
            });

            const zeroFretNoteMarksContainer = this.root.querySelector('[data-zero-fret-note-marks]');

            if (zeroFretNoteMarksContainer) {
                zeroFretNoteMarksContainer.innerHTML = null;

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

    window.Fretboard = Fretboard;

})();