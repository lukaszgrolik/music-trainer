export function styleString(style: {[key: string]: string}) {
    return Object.entries(style).map(([prop, val]) => {
        return `${prop}: ${style[prop]}`;
    }).join('; ');
}

export function chroma(note: string) {
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

export function lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
}
