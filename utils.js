(() => {

    function randomSample(arr) {
        const i = Math.floor(Math.random() * arr.length);
        return arr[i];
    }
    window.randomSample = randomSample;

    function randomSamples(arr, n) {
        const items = arr.slice();
        const res = new Array(n).fill(undefined);

        for (let i = 0; i < n; i++) {
            if (items.length === 0) break;
            const randomIndex = Math.floor(Math.random() * items.length);
            res[i] = items.splice(randomIndex, 1)[0];
        }

        return res;
    }
    window.randomSamples = randomSamples;

    function intersection(...arrays) {
        const rest = arrays.slice(1);

        return arrays[0].reduce((memo, val) => {
            const includesVal = arr => arr.includes(val);
            const ok = rest.every(includesVal);

            if (ok) memo.push(val);

            return memo;
        }, []);
    }
    window.intersection = intersection;

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