import {
    ChordInstrumentId,
    ChordInstrumentOption,
    ChordModId,
    PatternOption,
    ProgressionDisplayMode,
    ProgressionPreset,
    SampleInstrumentPreset,
    TtsSettings,
} from './chord-progressions-trainer.types';

export const SCALE_OPTIONS = [
    'C',
    'G',
    'D',
    'A',
    'E',
    'F',
    'Bb',
    'Eb',
    'Ab',
    'Am',
    'Em',
    'Bm',
    'F#m',
    'C#m',
    'Dm',
    'Gm',
];

export const COMMON_PROGRESSIONS: ProgressionPreset[] = [
    { id: 'minor-andalusian', group: 'Minor', label: 'i-VII-VI-V', numerals: ['i', 'VII', 'VI', 'V'] },
    { id: 'minor-alt-cadence', group: 'Minor', label: 'i-VI-iv-v', numerals: ['i', 'VI', 'iv', 'v'] },
    { id: 'minor-cinematic', group: 'Minor', label: 'i-bVII-bVI-bVII', numerals: ['i', 'bVII', 'bVI', 'bVII'] },
    { id: 'minor-pop', group: 'Minor', label: 'i-bVI-bIII-bVII', numerals: ['i', 'bVI', 'bIII', 'bVII'] },
    { id: 'major-pop', group: 'Major', label: 'I-V-vi-IV', numerals: ['I', 'V', 'vi', 'IV'] },
    { id: 'major-doowop', group: 'Major', label: 'I-vi-IV-V', numerals: ['I', 'vi', 'IV', 'V'] },
    { id: 'major-cadence', group: 'Major', label: 'ii-V-I', numerals: ['ii', 'V', 'I'] },
    { id: 'major-rock', group: 'Major', label: 'I-bVII-IV', numerals: ['I', 'bVII', 'IV'] },
    { id: 'jazz-turnaround', group: 'Jazz', label: 'ii-V-I-vi', numerals: ['ii', 'V', 'I', 'vi'] },
    { id: 'jazz-minor', group: 'Jazz', label: 'iiø-V-i', numerals: ['iiø', 'V', 'i'] },
    { id: 'cinematic-rise', group: 'Cinematic', label: 'i-bVI-III-bVII', numerals: ['i', 'bVI', 'III', 'bVII'] },
    { id: 'cinematic-lift', group: 'Cinematic', label: 'VI-i-VII-III', numerals: ['VI', 'i', 'VII', 'III'] },
];

export const PATTERN_OPTIONS: PatternOption[] = [
    { id: 'block', label: 'Block Chords' },
    { id: 'arpeggio-up', label: 'Broken Up (Arpeggio)' },
    { id: 'arpeggio-down', label: 'Broken Down (Arpeggio)' },
    { id: 'bass-chords', label: 'Bass + Chord Stabs' },
    { id: 'bass-walk', label: 'Bass Walk' },
];

export const DISPLAY_MODE_OPTIONS: Array<{ id: ProgressionDisplayMode; label: string }> = [
    { id: 'exact', label: 'Exact Order' },
    { id: 'random', label: 'Random Blocks' },
];

export const CHORD_INSTRUMENT_OPTIONS: ChordInstrumentOption[] = [
    { id: 'synth', label: 'Synth (Fast, Built-in)' },
    { id: 'piano', label: 'Piano (Sampled)' },
    { id: 'guitar-acoustic', label: 'Guitar Acoustic (Sampled)' },
    { id: 'guitar-nylon', label: 'Guitar Classical/Nylon (Sampled)' },
    { id: 'harp', label: 'Harp (Sampled)' },
    { id: 'flute', label: 'Flute (Sampled)' },
];

export const CHORD_MOD_OPTIONS: Array<{ id: ChordModId; label: string }> = [
    { id: 'min7', label: 'min7' },
    { id: 'maj7', label: 'maj7' },
    { id: 'dom7', label: 'dom7' },
    { id: 'sus4', label: 'sus4' },
];

export const SAMPLE_LIBRARY_BASE_URL = '/samples/tonejs';

export const SAMPLE_INSTRUMENT_PRESETS: Record<Exclude<ChordInstrumentId, 'synth'>, SampleInstrumentPreset> = {
    piano: {
        folderName: 'piano',
        release: 0.55,
        urls: {
            C2: 'C2.mp3',
            E2: 'E2.mp3',
            A2: 'A2.mp3',
            C3: 'C3.mp3',
            E3: 'E3.mp3',
            A3: 'A3.mp3',
            C4: 'C4.mp3',
            E4: 'E4.mp3',
            A4: 'A4.mp3',
            C5: 'C5.mp3',
        },
    },
    'guitar-acoustic': {
        folderName: 'guitar-acoustic',
        release: 0.45,
        urls: {
            D2: 'D2.mp3',
            G2: 'G2.mp3',
            A2: 'A2.mp3',
            C3: 'C3.mp3',
            E3: 'E3.mp3',
            G3: 'G3.mp3',
            A3: 'A3.mp3',
            C4: 'C4.mp3',
            E4: 'E4.mp3',
            A4: 'A4.mp3',
        },
    },
    'guitar-nylon': {
        folderName: 'guitar-nylon',
        release: 0.5,
        urls: {
            E2: 'E2.mp3',
            A2: 'A2.mp3',
            D3: 'D3.mp3',
            G3: 'G3.mp3',
            B3: 'B3.mp3',
            E4: 'E4.mp3',
            A4: 'A4.mp3',
            D5: 'D5.mp3',
        },
    },
    harp: {
        folderName: 'harp',
        release: 1.1,
        urls: {
            E1: 'E1.mp3',
            A2: 'A2.mp3',
            C3: 'C3.mp3',
            E3: 'E3.mp3',
            G3: 'G3.mp3',
            A4: 'A4.mp3',
            C5: 'C5.mp3',
            E5: 'E5.mp3',
        },
    },
    flute: {
        folderName: 'flute',
        release: 0.28,
        urls: {
            C4: 'C4.mp3',
            E4: 'E4.mp3',
            A4: 'A4.mp3',
            C5: 'C5.mp3',
            E5: 'E5.mp3',
            C6: 'C6.mp3',
            E6: 'E6.mp3',
            A6: 'A6.mp3',
        },
    },
};

export const TTS_SETTINGS_STORAGE_KEY = 'chordProgressionsTrainerTtsSettings';
export const CHORD_INSTRUMENT_STORAGE_KEY = 'chordProgressionsTrainerChordInstrument';
export const PROGRESSION_HISTORY_STORAGE_KEY = 'chordProgressionsTrainerProgressionHistory';

export const DEFAULT_TTS_SETTINGS: TtsSettings = {
    enabled: false,
    volume: 1,
    rate: 1,
    voiceURI: '',
    leadBeats: 1,
};
