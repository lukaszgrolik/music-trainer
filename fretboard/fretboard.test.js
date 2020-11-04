(() => {
    const guitarScale = (a) => a * 3;
    const fretboard = new Fretboard({
        frets: 24,
        // startingFret: shape.startingFret,
        strings: ['E', 'A', 'D', 'G', 'B', 'E'],
        stringsSize: [guitarScale(2), guitarScale(1 / 3)],
        firstFretAreaWidth: guitarScale(35),
        stringAreaHeight: guitarScale(10),
        fretWidth: guitarScale(3),
    });

    should();
})