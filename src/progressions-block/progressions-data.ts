export const visibleScales = [
    'major', 'ionian',
    'minor', 'aeolian',
    'major pentatonic', 'minor pentatonic', 'major blues', 'minor blues',
    'dorian', 'phrygian', 'lydian', 'mixolydian',
    'harmonic minor', 'dorian #4', 'phrygian dominant',
    'melodic minor', 'mixolydian b6', 'lydian dominant', 'altered',
    'double harmonic major', 'hungarian minor',
    'bebop',
    'flamenco',
];

export type ProgressionItem = string[] | {
    name?: string;
    info?: string;
    chords: string[];
}

export const keys = ['A', 'C', 'D', 'E', 'G'];
export const progressions: ProgressionItem[] = [
    ['Im', 'IVm', 'Vm'],
    ['Im', 'IVm', 'bVI', 'V7'],
    ['I', 'IV', 'V'],
    ['I', 'IV', 'V'],
    // http://musictheorysite.com/creating-diatonic-chord-progressions/
    ...[
        ['I', 'V', 'IV'],
        ['I', 'vi', 'IV', 'V'],
        ['I', 'V', 'vi', 'IV'],
    ],
    // minor plagal cadence
    { name: 'minor plagal cadence', chords: ['I', 'IVm', 'I'], info: 'iv-I instead of IV-I' },
    { name: 'minor plagal cadence', chords: ['I', 'IV', 'IVm', 'I'], info: 'iv-I instead of IV-I' },
    ...[
        // minor
        ['i', 'bVII', 'bVI'],
        ['bVI', 'i', 'bVII', 'i'],
        ['i', 'bVII', 'bVI', 'bVII'],
        ['i', 'bVI', 'bIII', 'bVII'],
        { chords: ['i', 'bVI', 'iv', 'V'], name: '', info: 'V instead of v' },
        { chords: ['i', 'bVI', 'iv', 'V7'], name: '', info: 'V7 instead of Vm7' },
        { chords: ['i', 'bVII', 'bVI', 'V7'], name: 'andalusian cadence' },
        ['i', 'bIII', 'iv', 'bVI'],
        ['i', 'bIII', 'bVI', 'V7'],
        ['iiø', 'V7', 'i'],
        // harmonic minor
        { chords: ['iiø', 'V', 'i'], name: '', info: 'neoclassical, medieval' },
        ['i', 'V', 'bVI', 'iv'],
        ['i', 'bVI', 'iiø', 'V'],
    ],
];
export const openChords = [
    'Em', 'E', 'Am', 'A',
    'D', 'Dm',
    'F', 'Fm',
    'C', 'G',
    // 7, m7, maj7
    'Em7', 'Emaj7', 'E7', 'Am7', 'Amaj7', 'A7', 'Dm7', 'Dmaj7', 'D7'
    // sus2, sus4
    // aug
];
export const barChords = [
    '', 'm', 'maj7', 'm7', '7', 'sus2', 'sus4', 'ø', '+'
];