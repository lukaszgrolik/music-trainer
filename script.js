(() => {

    class Store {
        // const notes = ['C', 'D', 'D#', 'F', 'G', 'G#', 'A#'];
        scaleName;
        latestScales = [];

        get notes() {
            if (!this.scaleName) return [];

            return Tonal.Scale.get(this.scaleName).notes;
        }
    }

    const store = new Store();
    const latestScalesStr = localStorage.getItem('latestScales');
    const latestScales = JSON.parse(latestScalesStr);

    store.latestScales = latestScales ? latestScales : [];
    store.scaleName = latestScales ? latestScales[0] : 'A minor';

    function updateLatestScalesTemplate() {
        document.querySelector('#latest-scales').innerHTML = store.latestScales.map(s => {
            return `<li style="font-weight: ${store.scaleName === s ? 'bold' : 'normal'};">${s}</li>`;
        }).join('');
    }

    updateLatestScalesTemplate();

    const piano = new Piano({octaves: 3});

    const guitarScale = (a) => a * 3;
    const fretboard = new Fretboard({
        FretboardTemplate: window.FretboardTemplateFull.FretboardTemplate,
        NoteMarkTemplate: window.FretboardTemplateFull.NoteMarkTemplate,
        frets: 24,
        startingFret: 0,
        strings: ['E', 'A', 'D', 'G', 'B', 'E'],
        stringsSize: [guitarScale(2), guitarScale(1/3)],
        firstFretAreaWidth: guitarScale(35),
        stringAreaHeight: guitarScale(10),
        fretWidth: guitarScale(3),
    });

    // const bassScale = a => a * 3;
    // const bassFretboard = new Fretboard({
    //     frets: 24,
    //     startingFret: 0,
    //     strings: ['E', 'A', 'D', 'G'],
    //     stringsSize: [bassScale(4), bassScale(2)],
    //     firstFretAreaWidth: bassScale(52),
    //     stringAreaHeight: bassScale(15),
    //     fretWidth: bassScale(3),
    // });

    const fretboardShapesBox = new FretboardShapesBox();
    const chordsTable = new ChordsTable(store);
    const progressionsBlock = new ProgressionsBlock(store);

    piano.render(document.getElementById('piano-root'));
    fretboard.render(document.getElementById('fretboard-root'));
    // bassFretboard.render(document.getElementById('bass-fretboard-root'));
    fretboardShapesBox.render(document.getElementById('fretboard-shapes-root'));
    chordsTable.render(document.getElementById('chords-table-root'))
    progressionsBlock.render(document.getElementById('progressions-root'))

    window.app = {
        showNotes() {
            // const input = notes.map(n => Tonal.Note.simplify(n));

            piano.showNotes(store.notes);
            fretboard.showNotes(store.notes);
            // bassFretboard.showNotes(input);

            chordsTable.update();
        },
        setScale(scale) {
            // const { notes } = Tonal.Scale.get(input.value);
            store.scaleName = scale;

            store.latestScales = store.latestScales.filter(s => s !== scale);
            store.latestScales.unshift(scale);

            updateLatestScalesTemplate();

            const latestScalesStr = JSON.stringify(store.latestScales);
            localStorage.setItem('latestScales', latestScalesStr);

            // console.log('notes', notes)
            app.showNotes();
        }
    }

    app.showNotes();

    document.querySelector('#scale-send-form form').addEventListener('submit', e => {
        e.preventDefault();
        const input = e.target.querySelector('input');

        if (input.value) {
            app.setScale(input.value);
        }
    });

    document.querySelector('#scale-send-form input').addEventListener('input', e => {
        const form = e.target.closest('form');
        const btn = form.querySelector('button');
        const info = form.querySelector('div');

        info.innerText = '';
        if (!e.target.value) btn.disabled = true;

        const {notes} = Tonal.Scale.get(e.target.value);

        const disabled = !notes || notes.length === 0;
        btn.disabled = disabled;

        if (!disabled) info.innerText = notes.join(', ');
    });

    document.querySelector('#latest-scales').addEventListener('click', e => {
        const el = e.target;
        if (el) {
            const scaleName = el.innerText;
            e.target.closest('#scale-send-form').querySelector('input').value = scaleName;
            app.setScale(scaleName);
        }
    });

})();
