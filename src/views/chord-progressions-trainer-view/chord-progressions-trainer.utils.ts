import * as Tonal from '@tonaljs/tonal';

import {
    CHORD_INSTRUMENT_OPTIONS,
    CHORD_INSTRUMENT_STORAGE_KEY,
    DEFAULT_TTS_SETTINGS,
    PROGRESSION_HISTORY_STORAGE_KEY,
    TTS_SETTINGS_STORAGE_KEY,
} from './chord-progressions-trainer.constants';
import {
    ChordInstrumentId,
    ChordModId,
    ChordModSettings,
    PatternId,
    PatternNoteEvent,
    ProgressionDisplayBlock,
    ProgressionHistoryEntry,
    TtsCueEvent,
    TtsSettings,
} from './chord-progressions-trainer.types';

export function formatDb(value: number): string {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)} dB`;
}

export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

export function loadTtsSettings(): TtsSettings {
    if (typeof window === 'undefined') return DEFAULT_TTS_SETTINGS;

    const raw = window.localStorage.getItem(TTS_SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_TTS_SETTINGS;

    try {
        const parsed = JSON.parse(raw) as Partial<TtsSettings>;
        return {
            enabled: Boolean(parsed.enabled),
            volume: clamp(Number(parsed.volume) || DEFAULT_TTS_SETTINGS.volume, 0, 1),
            rate: clamp(Number(parsed.rate) || DEFAULT_TTS_SETTINGS.rate, 0.5, 2),
            voiceURI: typeof parsed.voiceURI === 'string' ? parsed.voiceURI : '',
            leadBeats: clamp(Number(parsed.leadBeats) || DEFAULT_TTS_SETTINGS.leadBeats, 1, 2),
        };
    }
    catch {
        return DEFAULT_TTS_SETTINGS;
    }
}

export function loadChordInstrumentId(): ChordInstrumentId {
    if (typeof window === 'undefined') return 'synth';

    const raw = window.localStorage.getItem(CHORD_INSTRUMENT_STORAGE_KEY);
    if (!raw) return 'synth';

    const isKnown = CHORD_INSTRUMENT_OPTIONS.some(option => option.id === raw);
    return isKnown ? (raw as ChordInstrumentId) : 'synth';
}

export function loadProgressionHistory(): ProgressionHistoryEntry[] {
    if (typeof window === 'undefined') return [];

    const raw = window.localStorage.getItem(PROGRESSION_HISTORY_STORAGE_KEY);
    if (!raw) return [];

    try {
        const parsed = JSON.parse(raw) as unknown;
        if (!Array.isArray(parsed)) return [];

        return parsed.flatMap(item => {
            if (!item || typeof item !== 'object') return [];

            const candidate = item as ProgressionHistoryEntry;
            if (typeof candidate.key !== 'string') return [];
            if (typeof candidate.label !== 'string') return [];
            if (!Array.isArray(candidate.numerals) || !candidate.numerals.every(numeral => typeof numeral === 'string')) return [];

            return [{
                key: candidate.key,
                label: candidate.label,
                numerals: candidate.numerals,
            }];
        }).slice(0, 20);
    }
    catch {
        return [];
    }
}

export function saveProgressionHistory(history: ProgressionHistoryEntry[]): void {
    if (typeof window === 'undefined') return;

    window.localStorage.setItem(PROGRESSION_HISTORY_STORAGE_KEY, JSON.stringify(history.slice(0, 20)));
}

export function cancelSpeechSynthesis() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
}

export function toSpokenChordName(chordName: string): string {
    const parsed = Tonal.Chord.get(chordName);
    const sourceName = (!parsed.empty && parsed.name) ? parsed.name : chordName;

    // TTS engines often read '#' as "number"; convert accidentals to words.
    const accidentalExpanded = sourceName.replace(/([A-G])([#b]+)/g, (_, note: string, accidentals: string) => {
        const words = accidentals
            .split('')
            .map(accidental => accidental === '#' ? 'sharp' : 'flat')
            .join(' ');

        return `${note} ${words}`;
    });

    return accidentalExpanded.replace(/\s+/g, ' ').trim();
}

export function normalizeRomanNumeral(numeral: string): string {
    return numeral
        .trim()
        .replace(/♭/g, 'b')
        .replace(/♯/g, '#')
        .replace(/º/g, '°');
}

export function scaleToTonic(scaleName: string): string {
    return scaleName.trim();
}

export function parseProgressionText(rawText: string): string[] {
    const normalized = rawText
        .replace(/[\u2013\u2014]/g, '-')
        .trim();

    if (!normalized) return [];

    const tokens = normalized
        .split(/[\s,|]+/)
        .flatMap(part => part.split('-'))
        .map(part => part.trim())
        .filter(Boolean);

    return tokens
        .filter(token => /[ivIV]/.test(token))
        .map(normalizeRomanNumeral);
}

function romanToDegree(roman: string): number {
    const normalized = roman.toUpperCase();

    if (normalized === 'I') return 1;
    if (normalized === 'II') return 2;
    if (normalized === 'III') return 3;
    if (normalized === 'IV') return 4;
    if (normalized === 'V') return 5;
    if (normalized === 'VI') return 6;
    if (normalized === 'VII') return 7;

    return 0;
}

function applyAccidentals(note: string, accidental: string): string {
    let next = note;

    for (const char of accidental) {
        if (char === 'b') {
            next = Tonal.Note.transpose(next, '-2m');
            continue;
        }

        if (char === '#') {
            next = Tonal.Note.transpose(next, '2m');
        }
    }

    return Tonal.Note.get(next).pc || note;
}

function toChordSuffix(roman: string, rawSuffix: string): string {
    const suffix = rawSuffix.trim();

    if (!suffix) {
        return roman === roman.toLowerCase() ? 'm' : '';
    }

    if (suffix.includes('ø')) return 'm7b5';
    if (suffix.includes('°') || /dim/i.test(suffix)) return 'dim';
    if (/^m(?!aj)/i.test(suffix)) return suffix;
    if (/^maj/i.test(suffix)) return suffix;
    if (/^sus/i.test(suffix)) return suffix;
    if (/^add/i.test(suffix)) return suffix;
    if (/^\d+$/.test(suffix)) {
        return roman === roman.toLowerCase() ? `m${suffix}` : suffix;
    }

    return roman === roman.toLowerCase() ? `m${suffix}` : suffix;
}

export function buildChordsFromRomanNumerals(scaleName: string, numerals: string[]): string[] {
    const normalizedScale = scaleName.trim();
    const isMinorScale = /m$/i.test(normalizedScale) || /\sminor$/i.test(normalizedScale);
    const tonic = normalizedScale
        .replace(/\sminor$/i, '')
        .replace(/m$/i, '')
        .trim();
    const scaleType = isMinorScale ? 'minor' : 'major';

    const scaleNotes = Tonal.Scale.get(`${tonic} ${scaleType}`).notes;
    if (scaleNotes.length < 7) return numerals.map(() => '');

    return numerals.map(numeral => {
        const normalizedNumeral = normalizeRomanNumeral(numeral);
        const match = normalizedNumeral.match(/^([b#]*)([ivIV]+)(.*)$/);
        if (!match) return '';

        const [, accidental, roman, suffix] = match;
        const degree = romanToDegree(roman);
        if (!degree) return '';

        const baseNote = scaleNotes[degree - 1];
        const root = applyAccidentals(baseNote, accidental);
        return `${root}${toChordSuffix(roman, suffix)}`;
    });
}

function getChordRoot(chordName: string): string {
    const parsed = Tonal.Chord.get(chordName);
    if (!parsed.empty && parsed.tonic) return parsed.tonic;

    const match = chordName.trim().match(/^[A-G](?:#|b)?/);
    return match?.[0] || 'C';
}

function applyChordMod(root: string, modId: ChordModId): string {
    if (modId === 'min7') return `${root}m7`;
    if (modId === 'maj7') return `${root}maj7`;
    if (modId === 'dom7') return `${root}7`;
    return `${root}sus4`;
}

export function applyChordMods(chords: string[], chordMods: ChordModSettings): string[] {
    const enabledModIds = (Object.keys(chordMods) as ChordModId[]).filter(modId => chordMods[modId]);
    if (!enabledModIds.length) return chords;

    return chords.map((chordName, index) => {
        const root = getChordRoot(chordName);
        const modId = enabledModIds[index % enabledModIds.length];
        return applyChordMod(root, modId);
    });
}

function buildChordNotes(chordName: string): string[] {
    const parsed = Tonal.Chord.get(chordName);

    if (!parsed.notes.length) return ['C4', 'E4', 'G4'];

    return parsed.notes.map(note => `${note}4`);
}

function toBassNote(note: string): string {
    const parsed = Tonal.Note.get(note);
    const pc = parsed.pc || 'C';
    return `${pc}2`;
}

function buildBassWalkNotes(rootNote: string, nextRootNote: string, beatsPerChord: number): string[] {
    const rootBass = toBassNote(rootNote);
    const nextBass = toBassNote(nextRootNote);

    const startMidi = Tonal.Note.midi(rootBass) ?? 36;
    let endMidi = Tonal.Note.midi(nextBass) ?? (startMidi + 2);

    while (endMidi - startMidi > 7) endMidi -= 12;
    while (startMidi - endMidi > 7) endMidi += 12;

    const values: string[] = [];

    for (let i = 0; i < beatsPerChord; i++) {
        const t = beatsPerChord <= 1 ? 0 : (i / (beatsPerChord - 1));
        const midi = Math.round(startMidi + (endMidi - startMidi) * t);
        values.push(Tonal.Note.fromMidi(midi) || rootBass);
    }

    return values;
}

export function buildPatternEvents(
    patternId: PatternId,
    tonalChords: string[],
    beatDurationSeconds: number,
    beatsPerChord: number,
): PatternNoteEvent[] {
    const chordDurationSeconds = beatDurationSeconds * beatsPerChord;

    return tonalChords.flatMap((chord, index) => {
        const chordNotes = buildChordNotes(chord);
        const rootNote = chordNotes[0] || 'C4';
        const nextChord = tonalChords[(index + 1) % tonalChords.length] || tonalChords[0] || chord;
        const nextRootNote = buildChordNotes(nextChord)[0] || rootNote;
        const start = index * chordDurationSeconds;

        if (patternId === 'block') {
            return [{ time: start, note: chordNotes, duration: chordDurationSeconds * .96, velocity: .92 }];
        }

        if (patternId === 'arpeggio-up' || patternId === 'arpeggio-down') {
            const stepDuration = beatDurationSeconds / 2;
            const totalSteps = Math.max(1, beatsPerChord * 2);
            const source = patternId === 'arpeggio-down' ? chordNotes.slice().reverse() : chordNotes;

            return new Array(totalSteps).fill(undefined).map((_, step) => {
                const note = source[step % source.length] || rootNote;
                return {
                    time: start + step * stepDuration,
                    note,
                    duration: stepDuration * .9,
                    velocity: .8,
                };
            });
        }

        if (patternId === 'bass-chords') {
            const upperChord = chordNotes.slice(1).length ? chordNotes.slice(1) : chordNotes;

            return new Array(Math.max(1, beatsPerChord)).fill(undefined).map((_, beat) => {
                return {
                    time: start + beat * beatDurationSeconds,
                    note: beat === 0 ? toBassNote(rootNote) : upperChord,
                    duration: beatDurationSeconds * .86,
                    velocity: beat === 0 ? .92 : .7,
                };
            });
        }

        const walkNotes = buildBassWalkNotes(rootNote, nextRootNote, Math.max(1, beatsPerChord));
        return walkNotes.map((walkNote, beat) => {
            return {
                time: start + beat * beatDurationSeconds,
                note: walkNote,
                duration: beatDurationSeconds * .9,
                velocity: .86,
            };
        });
    });
}

export function buildTtsCueEvents(
    tonalChords: string[],
    chordDurationSeconds: number,
    leadSeconds: number,
    progressionDurationSeconds: number,
    withLoop: boolean,
): TtsCueEvent[] {
    if (!tonalChords.length) return [];

    return tonalChords.flatMap((chordName, chordIndex) => {
        const chordStart = chordIndex * chordDurationSeconds;
        const cueTime = chordStart - leadSeconds;

        if (cueTime >= 0) {
            return [{ time: cueTime, chordName }];
        }

        if (withLoop && progressionDurationSeconds > 0) {
            return [{ time: progressionDurationSeconds + cueTime, chordName }];
        }

        // Do not announce the first chord on initial run.
        return [];
    });
}

export function buildRandomProgressionBlocks(sourceBlocks: ProgressionDisplayBlock[], count: number): ProgressionDisplayBlock[] {
    const normalizedCount = Math.max(1, Math.floor(count));
    if (!sourceBlocks.length) return [];

    const result: ProgressionDisplayBlock[] = [];

    for (let index = 0; index < normalizedCount; index += 1) {
        const prev = result[result.length - 1];
        const prevPrev = result[result.length - 2];
        const mustAvoidChord = (prev && prevPrev && prev.chord === prevPrev.chord) ? prev.chord : '';

        const candidates = mustAvoidChord
            ? sourceBlocks.filter(block => block.chord !== mustAvoidChord)
            : sourceBlocks;
        const selectable = candidates.length ? candidates : sourceBlocks;
        const randomIndex = Math.floor(Math.random() * selectable.length);

        result.push(selectable[randomIndex]);
    }

    return result;
}
