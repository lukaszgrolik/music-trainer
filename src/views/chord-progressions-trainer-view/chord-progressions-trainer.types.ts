export type ProgressionPreset = {
    id: string;
    group: string;
    label: string;
    numerals: string[];
};

export type PatternId = 'block' | 'arpeggio-up' | 'arpeggio-down' | 'bass-chords' | 'bass-walk';

export type ProgressionDisplayMode = 'exact' | 'random';

export type ProgressionDisplayBlock = {
    numeral: string;
    chord: string;
};

export type PatternOption = {
    id: PatternId;
    label: string;
};

export type ChordInstrumentId = 'synth' | 'piano' | 'guitar-acoustic' | 'guitar-nylon' | 'harp' | 'flute';

export type ChordInstrumentOption = {
    id: ChordInstrumentId;
    label: string;
};

export type ChordModId = 'min7' | 'maj7' | 'dom7' | 'sus4';

export type ChordModSettings = Record<ChordModId, boolean>;

export type ProgressionHistoryEntry = {
    key: string;
    label: string;
    numerals: string[];
};

export type SampleInstrumentPreset = {
    folderName: string;
    urls: Record<string, string>;
    release: number;
};

export type PatternNoteEvent = {
    time: number;
    note: string | string[];
    duration: number;
    velocity?: number;
};

export type TtsSettings = {
    enabled: boolean;
    volume: number;
    rate: number;
    voiceURI: string;
    leadBeats: number;
};

export type TtsCueEvent = {
    time: number;
    chordName: string;
};
