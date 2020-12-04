export const texts = [
    {
        name: 'C minor chords',
        text: `// C minor chords
Cm
Dm7b5
Eb
Fm
Gm G7
Ab
Bb

// C harmonic minor chords
Cm
Ddim7
E+
Fm Fdim7
G G7 G+
Ab Abm Abdim7
Bdim7

// G phrygian dominant
// F dorian #4

// C hungarian minor - C harmonic minor #4
Cm Cdim

Eb+

G G+
Ab Abm Abdim
B Bm B+

// G double harmonic major - G phrygian dominant #7`,
    },
    {
        name: 'D minor chords',
        text: `// D minor chords
Dm
Em7b5
Fb
Gm
Am A7
Bb
C

// D harmonic minor chords
Dm
Edim7
F+
Gm Gdim7
A A7 A+
Bb Bbm Bbdim7
C#dim7

// A phrygian dominant
// G dorian #4
// D hungarian minor - D harmonic minor #4
// A double harmonic major - A phrygian dominant #7`,
    },
    {
        name: 'G minor chords',
        text: `// G minor chords
Gm
Am7b5
Bb
Cm
Dm D7
Eb
F

// G harmonic minor chords
Gm
Adim7
Bb+
Cm Cdim7
D D7 D+
Eb Ebm Ebdim7
F#dim7

// D phrygian dominant
// C dorian #4
// G hungarian minor - G harmonic minor #4
// D double harmonic major - D phrygian dominant #7`,
    },
    {
        name: 'black keys',
        text: `// black keys

C# C#m Db Dbm
D# D#m Eb Ebm
F# F#m Gb Gbm
G# G#m Ab Abm
A# A#m Bb Bbm`,
    },
    {
        name: 'inversions',
        text: `// inversions

A A/1 A/2 Am Am/1 Am/2
B B/1 B/2 Bm Bm/1 Bm/2
C C/1 C/2 Cm Cm/1 Cm/2
D D/1 D/2 Dm Dm/1 Dm/2
E E/1 E/2 Em Em/1 Em/2
F F/1 F/2 Fm Fm/1 Fm/2
G G/1 G/2 Gm Gm/1 Gm/2`,
    },
    {
        name: 'black keys inversions',
        text: `// black keys inversions

Eb Eb/1 Eb/2
//D# D#/1 D#/2

Ab Ab/1 Ab/2
//G# G#/1 G#/2

Bb Bb/1 Bb/2
//A# A#/1 A#/2`,
    },
    {
        name: 'B only',
        text: `// B only

B B/1 B/2 Bm Bm/1 Bm/2`,
    },
];

export const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
export const accidentals = [
    ['', 'none'],
    ['#', '#'],
    ['b', '♭'],
];
export const accidentalsSpeech = [
    ['', ''],
    ['#', 'sharp'],
    ['b', 'flat'],
];
export const chordTypes = [
    ['', 'major'],
    ['m', 'minor'],
    ['m7', 'minor 7'],
    ['maj7', 'major 7'],
    ['7', 'dominant'],
    ['m7b5', 'half dim'],
    ['dim7', 'full dim'],
    ['+', 'augmented'],
    ['sus2', 'sass 2'],
    ['sus4', 'sass 4'],
];
export const scales = [
    'minor',
    'major',
    'minor pentatonic',
    'major pentatonic',
    'blues',
    // 'dorian',
    // 'phrygian',
    // 'lydian',
    // 'mixolydian',
    'harmonic minor',
    'dorian #4',
    'phrygian dominant',
    // 'double melodic major',
    'hungarian minor',
    'locrian ♭♭3 ♭♭7',
];
export const sequences = [
    '1',
    '11',
    '111',
    '123',
    '321',
    '231',
    '1234',
    '4321',
    '1323',
    '3213',
    '3123',
    '12345432',
    '15354535',
    '212321',
    '51413121',
];