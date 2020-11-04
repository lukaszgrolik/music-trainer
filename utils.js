(() => {
    function styleString(style) {
        return Object.entries(style).map(([prop, val]) => {
            return `${prop}: ${style[prop]}`;
        }).join('; ');
    }

    window.styleString = styleString;

    function chroma(note) {
        const letters = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
        const letter = note.slice(0, 1).toLowerCase();
        const acc = note.slice(1);

        if (!letters.hasOwnProperty(letter)) return undefined;
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

    window.chroma = chroma;

})();