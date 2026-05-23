import * as React from 'react';
import { observer } from 'mobx-react-lite';
import * as Tone from 'tone';

import {
    CHORD_INSTRUMENT_STORAGE_KEY,
    COMMON_PROGRESSIONS,
    SAMPLE_INSTRUMENT_PRESETS,
    SAMPLE_LIBRARY_BASE_URL,
    TTS_SETTINGS_STORAGE_KEY,
} from './chord-progressions-trainer.constants';
import {
    Wrapper,
} from './chord-progressions-trainer.styles';
import {
    ChordInstrumentId,
    ChordModSettings,
    PatternId,
    PatternNoteEvent,
    ProgressionDisplayBlock,
    ProgressionDisplayMode,
    ProgressionHistoryEntry,
    ProgressionPreset,
    TtsCueEvent,
    TtsSettings,
} from './chord-progressions-trainer.types';
import {
    applyChordMods,
    buildRandomProgressionBlocks,
    buildChordsFromRomanNumerals,
    buildPatternEvents,
    buildTtsCueEvents,
    cancelSpeechSynthesis,
    loadChordInstrumentId,
    loadProgressionHistory,
    loadTtsSettings,
    parseProgressionText,
    saveProgressionHistory,
    toSpokenChordName,
} from './chord-progressions-trainer.utils';
import {
    TrainerControlsPanel,
    TrainerControlsPanelModel,
    TrainerControlsPanelRuntime,
    TrainerControlsPanelSetters,
} from './chord-progressions-trainer-controls-panel';
import { TrainerStatusPanel } from './chord-progressions-trainer-status-panel';
import { TrainerProgressGrid } from './chord-progressions-trainer-progress-grid';
export const ChordProgressionsTrainerView: React.FC = observer(() => {
    const [scaleName, setScaleName] = React.useState('Em');
    const [progressionId, setProgressionId] = React.useState(COMMON_PROGRESSIONS[0].id);
    const [bpm, setBpm] = React.useState(100);
    const [beatsPerChord, setBeatsPerChord] = React.useState(4);
    const [withMetronome, setWithMetronome] = React.useState(true);
    const [withLoop, setWithLoop] = React.useState(true);
    const [patternId, setPatternId] = React.useState<PatternId>('block');
    const [displayMode, setDisplayMode] = React.useState<ProgressionDisplayMode>('exact');
    const [randomBlocksCount, setRandomBlocksCount] = React.useState(8);
    const [randomDisplayBlocks, setRandomDisplayBlocks] = React.useState<ProgressionDisplayBlock[]>([]);
    const [chordInstrumentId, setChordInstrumentId] = React.useState<ChordInstrumentId>(() => loadChordInstrumentId());
    const [chordsVolume, setChordsVolume] = React.useState(-8);
    const [metronomeVolume, setMetronomeVolume] = React.useState(-16);
    const [isInstrumentLoading, setIsInstrumentLoading] = React.useState(false);
    const [instrumentError, setInstrumentError] = React.useState('');
    const [ttsSettings, setTtsSettings] = React.useState<TtsSettings>(() => loadTtsSettings());
    const [ttsVoices, setTtsVoices] = React.useState<SpeechSynthesisVoice[]>([]);
    const [customProgressionText, setCustomProgressionText] = React.useState('i-VII-VI-V');
    const [customProgressionError, setCustomProgressionError] = React.useState('');
    const [useCustomProgression, setUseCustomProgression] = React.useState(false);
    const [chordMods, setChordMods] = React.useState<ChordModSettings>({
        min7: false,
        maj7: false,
        dom7: false,
        sus4: false,
    });
    const [progressionHistory, setProgressionHistory] = React.useState<ProgressionHistoryEntry[]>(() => loadProgressionHistory());

    const [isPlaying, setIsPlaying] = React.useState(false);
    const [isPaused, setIsPaused] = React.useState(false);
    const [activeChordIndex, setActiveChordIndex] = React.useState(-1);
    const [playProgress, setPlayProgress] = React.useState(0);
    const supportsTts = typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

    const chordPartRef = React.useRef<Tone.Part<PatternNoteEvent> | null>(null);
    const markerSequenceRef = React.useRef<Tone.Sequence<number> | null>(null);
    const ttsPartRef = React.useRef<Tone.Part<TtsCueEvent> | null>(null);
    const metronomeLoopRef = React.useRef<Tone.Loop | null>(null);
    const stopEventIdRef = React.useRef<number | null>(null);
    const animationFrameRef = React.useRef<number | null>(null);
    const pausedAtRef = React.useRef(0);
    const withLoopRef = React.useRef(withLoop);
    withLoopRef.current = withLoop;
    const chordInstrumentRef = React.useRef<Tone.PolySynth | Tone.Sampler | null>(null);
    const chordInstrumentIdRef = React.useRef<ChordInstrumentId | null>(null);
    const metronomeSynthRef = React.useRef<Tone.Synth | null>(null);
    const ttsSettingsRef = React.useRef(ttsSettings);
    const ttsVoicesRef = React.useRef(ttsVoices);
    ttsSettingsRef.current = ttsSettings;
    ttsVoicesRef.current = ttsVoices;

    const selectedProgression = React.useMemo(() => {
        return COMMON_PROGRESSIONS.find(item => item.id === progressionId) || COMMON_PROGRESSIONS[0];
    }, [progressionId]);

    const customNumerals = React.useMemo(() => {
        return parseProgressionText(customProgressionText);
    }, [customProgressionText]);

    const activeNumerals = React.useMemo(() => {
        if (useCustomProgression && customNumerals.length) return customNumerals;
        return selectedProgression.numerals;
    }, [customNumerals, selectedProgression.numerals, useCustomProgression]);

    const activeProgressionLabel = React.useMemo(() => {
        if (useCustomProgression && customNumerals.length) return `Custom: ${customNumerals.join('-')}`;
        return selectedProgression.label;
    }, [customNumerals, selectedProgression.label, useCustomProgression]);

    const activeProgressionKey = React.useMemo(() => {
        return `${scaleName}|${activeNumerals.join('-')}`;
    }, [activeNumerals, scaleName]);

    const pushHistoryEntry = React.useCallback((entry: ProgressionHistoryEntry) => {
        setProgressionHistory(prev => {
            const withoutCurrent = prev.filter(item => item.key !== entry.key);
            return [entry, ...withoutCurrent].slice(0, 20);
        });
    }, []);

    React.useEffect(() => {
        saveProgressionHistory(progressionHistory);
    }, [progressionHistory]);

    React.useEffect(() => {
        if (!progressionHistory.length) {
            pushHistoryEntry({
                key: activeProgressionKey,
                label: `${scaleName} · ${activeProgressionLabel}`,
                numerals: activeNumerals,
            });
        }
    }, [activeNumerals, activeProgressionKey, activeProgressionLabel, progressionHistory.length, pushHistoryEntry, scaleName]);

    const tonalChords = React.useMemo(() => {
        const baseChords = buildChordsFromRomanNumerals(scaleName, activeNumerals);

        return applyChordMods(baseChords, chordMods);
    }, [activeNumerals, chordMods, scaleName]);

    const baseProgressionBlocks = React.useMemo<ProgressionDisplayBlock[]>(() => {
        return activeNumerals.map((numeral, index) => ({
            numeral,
            chord: tonalChords[index] || '',
        }));
    }, [activeNumerals, tonalChords]);

    const regenerateRandomBlocks = React.useCallback(() => {
        setRandomDisplayBlocks(buildRandomProgressionBlocks(baseProgressionBlocks, randomBlocksCount));
    }, [baseProgressionBlocks, randomBlocksCount]);

    React.useEffect(() => {
        if (displayMode !== 'random') return;
        regenerateRandomBlocks();
    }, [displayMode, regenerateRandomBlocks]);

    const progressionDisplayBlocks = React.useMemo<ProgressionDisplayBlock[]>(() => {
        if (displayMode === 'exact') return baseProgressionBlocks;
        if (randomDisplayBlocks.length) return randomDisplayBlocks;
        return buildRandomProgressionBlocks(baseProgressionBlocks, randomBlocksCount);
    }, [baseProgressionBlocks, displayMode, randomBlocksCount, randomDisplayBlocks]);

    const playbackBlocks = progressionDisplayBlocks;
    const playbackNumerals = React.useMemo(() => playbackBlocks.map(block => block.numeral), [playbackBlocks]);
    const playbackChords = React.useMemo(() => playbackBlocks.map(block => block.chord), [playbackBlocks]);

    const beatDurationSeconds = 60 / bpm;
    const chordDurationSeconds = beatDurationSeconds * beatsPerChord;
    const progressionDurationSeconds = playbackChords.length * chordDurationSeconds;
    const progressionsByGroup = React.useMemo(() => {
        return COMMON_PROGRESSIONS.reduce((memo: Record<string, ProgressionPreset[]>, prog) => {
            if (!memo[prog.group]) memo[prog.group] = [];
            memo[prog.group].push(prog);
            return memo;
        }, {});
    }, []);

    const clearPlaybackEngines = React.useCallback(() => {
        if (animationFrameRef.current !== null) {
            window.cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }

        chordPartRef.current?.stop(0);
        chordPartRef.current?.dispose();
        chordPartRef.current = null;

        markerSequenceRef.current?.stop(0);
        markerSequenceRef.current?.dispose();
        markerSequenceRef.current = null;

        ttsPartRef.current?.stop(0);
        ttsPartRef.current?.dispose();
        ttsPartRef.current = null;

        metronomeLoopRef.current?.stop(0);
        metronomeLoopRef.current?.dispose();
        metronomeLoopRef.current = null;

        if (stopEventIdRef.current !== null) {
            Tone.Transport.clear(stopEventIdRef.current);
            stopEventIdRef.current = null;
        }
    }, []);

    const speakChord = React.useCallback((chordName: string) => {
        if (!supportsTts) return;

        const settings = ttsSettingsRef.current;
        if (!settings.enabled) return;

        const utterance = new SpeechSynthesisUtterance(toSpokenChordName(chordName));
        utterance.volume = settings.volume;
        utterance.rate = settings.rate;

        if (settings.voiceURI) {
            const voice = ttsVoicesRef.current.find(item => item.voiceURI === settings.voiceURI);
            if (voice) utterance.voice = voice;
        }

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
    }, [supportsTts]);

    const stopPlayback = React.useCallback((mode: 'reset' | 'pause') => {
        const currentPos = Math.max(0, Math.min(Tone.Transport.seconds, progressionDurationSeconds));

        chordInstrumentRef.current?.releaseAll(Tone.now());
        metronomeSynthRef.current?.triggerRelease(Tone.now());
        cancelSpeechSynthesis();

        clearPlaybackEngines();

        Tone.Transport.stop();
        Tone.Transport.cancel(0);

        if (mode === 'pause') {
            pausedAtRef.current = currentPos;
            Tone.Transport.position = pausedAtRef.current;
            setPlayProgress(progressionDurationSeconds > 0 ? pausedAtRef.current / progressionDurationSeconds : 0);
            setIsPaused(true);
        }
        else {
            pausedAtRef.current = 0;
            Tone.Transport.position = 0;
            setPlayProgress(0);
            setIsPaused(false);
        }

        setIsPlaying(false);
        setActiveChordIndex(-1);
    }, [clearPlaybackEngines, progressionDurationSeconds]);

    const runProgressAnimation = React.useCallback((startAtSeconds: number) => {
        setPlayProgress(progressionDurationSeconds > 0 ? startAtSeconds / progressionDurationSeconds : 0);

        const updateProgress = () => {
            if (Tone.Transport.state !== 'started') {
                animationFrameRef.current = window.requestAnimationFrame(updateProgress);
                return;
            }

            if (progressionDurationSeconds <= 0) {
                setPlayProgress(0);
            }
            else {
                const elapsed = Tone.Transport.seconds;
                const wrapped = withLoopRef.current ? (elapsed % progressionDurationSeconds) : Math.min(elapsed, progressionDurationSeconds);
                setPlayProgress(wrapped / progressionDurationSeconds);
            }

            animationFrameRef.current = window.requestAnimationFrame(updateProgress);
        };

        animationFrameRef.current = window.requestAnimationFrame(updateProgress);
    }, [progressionDurationSeconds]);

    const startPlayback = React.useCallback(async (startAtSeconds: number) => {
        if (!playbackChords.length || progressionDurationSeconds <= 0) return;

        await Tone.start();

        stopPlayback('reset');

        setInstrumentError('');

        if (chordInstrumentRef.current && chordInstrumentIdRef.current !== chordInstrumentId) {
            chordInstrumentRef.current.dispose();
            chordInstrumentRef.current = null;
            chordInstrumentIdRef.current = null;
        }

        if (!chordInstrumentRef.current) {
            setIsInstrumentLoading(true);

            try {
                if (chordInstrumentId === 'synth') {
                    const synth = new Tone.PolySynth(Tone.Synth).toDestination();
                    synth.set({
                        oscillator: { type: 'triangle' },
                        envelope: { attack: 0.01, decay: 0.08, sustain: 0.65, release: 0.12 },
                    });
                    chordInstrumentRef.current = synth;
                }
                else {
                    const preset = SAMPLE_INSTRUMENT_PRESETS[chordInstrumentId];
                    const sampler = new Tone.Sampler({
                        urls: preset.urls,
                        baseUrl: `${SAMPLE_LIBRARY_BASE_URL}/${preset.folderName}/`,
                        release: preset.release,
                    }).toDestination();

                    await Tone.loaded();
                    chordInstrumentRef.current = sampler;
                }

                chordInstrumentIdRef.current = chordInstrumentId;
            }
            catch {
                setInstrumentError('Failed to load selected instrument samples. Check network/assets and try again.');
                setIsInstrumentLoading(false);
                return;
            }

            setIsInstrumentLoading(false);
        }

        if (chordInstrumentRef.current) {
            chordInstrumentRef.current.volume.value = chordsVolume;
        }

        if (!metronomeSynthRef.current) {
            metronomeSynthRef.current = new Tone.Synth({
                oscillator: { type: 'square' },
                envelope: { attack: 0.001, decay: 0.03, sustain: 0, release: 0.012 },
            }).toDestination();
        }
        metronomeSynthRef.current.volume.value = metronomeVolume;

        Tone.Transport.bpm.value = bpm;
        Tone.Transport.cancel(0);
        // Start 20 ms before the target position so the event AT that position is
        // in the future (Tone.js skips events exactly at the start boundary).
        const PREBUFFER = 0.02;
        Tone.Transport.position = Math.max(0, Math.min(startAtSeconds - PREBUFFER, progressionDurationSeconds));

        const patternEvents = buildPatternEvents(patternId, playbackChords, beatDurationSeconds, beatsPerChord);
        const ttsLeadSeconds = beatDurationSeconds * ttsSettings.leadBeats;
        const ttsCueEvents = buildTtsCueEvents(
            playbackChords,
            chordDurationSeconds,
            ttsLeadSeconds,
            progressionDurationSeconds,
            withLoop,
        );

        if (startAtSeconds > 0) {
            const RESUME_EPSILON = 1e-3;
            const hasEventAtStart = patternEvents.some(event => Math.abs(event.time - startAtSeconds) < RESUME_EPSILON);

            if (!hasEventAtStart) {
                let activeEvent: PatternNoteEvent | null = null;
                for (let index = patternEvents.length - 1; index >= 0; index -= 1) {
                    const event = patternEvents[index];
                    if (
                        event.time <= startAtSeconds + RESUME_EPSILON
                        && event.time + event.duration > startAtSeconds + RESUME_EPSILON
                    ) {
                        activeEvent = event;
                        break;
                    }
                }

                if (activeEvent) {
                    const remainingDuration = Math.max(0.03, activeEvent.time + activeEvent.duration - startAtSeconds);
                    chordInstrumentRef.current?.triggerAttackRelease(
                        activeEvent.note,
                        remainingDuration,
                        Tone.now() + 0.005,
                        activeEvent.velocity,
                    );
                }
            }
        }

        chordPartRef.current = new Tone.Part<PatternNoteEvent>((time, event) => {
            chordInstrumentRef.current?.triggerAttackRelease(event.note, event.duration, time, event.velocity);
        }, patternEvents);
        chordPartRef.current.loop = withLoop;
        chordPartRef.current.loopEnd = progressionDurationSeconds;
        chordPartRef.current.start(0);

        markerSequenceRef.current = new Tone.Sequence<number>({
            subdivision: chordDurationSeconds,
            loop: withLoop,
            events: playbackChords.map((_, index) => index),
            callback: (time, index) => {
                Tone.Draw.schedule(() => {
                    setActiveChordIndex(index);
                }, time);
            },
        });
        markerSequenceRef.current.start(0);

        ttsPartRef.current = new Tone.Part<TtsCueEvent>((time, event) => {
            Tone.Draw.schedule(() => {
                speakChord(event.chordName);
            }, time);
        }, ttsCueEvents);
        ttsPartRef.current.loop = withLoop;
        ttsPartRef.current.loopEnd = progressionDurationSeconds;
        ttsPartRef.current.start(0);

        if (withMetronome) {
            let beatCounter = Math.floor(startAtSeconds / beatDurationSeconds);

            metronomeLoopRef.current = new Tone.Loop(time => {
                const isAccent = beatCounter % beatsPerChord === 0;
                metronomeSynthRef.current?.triggerAttackRelease(isAccent ? 'C6' : 'G5', isAccent ? 0.06 : 0.04, time);
                beatCounter += 1;
            }, beatDurationSeconds);
            metronomeLoopRef.current.start(0);
        }

        if (!withLoop) {
            const remaining = Math.max(0.001, progressionDurationSeconds - startAtSeconds);
            stopEventIdRef.current = Tone.Transport.scheduleOnce(time => {
                Tone.Draw.schedule(() => {
                    stopPlayback('reset');
                }, time);
            }, `+${remaining}`);
        }

        setIsPaused(false);
        setIsPlaying(true);
        runProgressAnimation(startAtSeconds);
        Tone.Transport.start();
    }, [
        playbackChords,
        progressionDurationSeconds,
        stopPlayback,
        chordsVolume,
        metronomeVolume,
        bpm,
        patternId,
        chordInstrumentId,
        beatDurationSeconds,
        beatsPerChord,
        ttsSettings.leadBeats,
        withLoop,
        withMetronome,
        chordDurationSeconds,
        runProgressAnimation,
        speakChord,
    ]);

    React.useEffect(() => {
        if (!supportsTts) return;

        const synth = window.speechSynthesis;
        const updateVoices = () => {
            setTtsVoices(synth.getVoices());
        };

        updateVoices();
        synth.addEventListener('voiceschanged', updateVoices);

        return () => {
            synth.removeEventListener('voiceschanged', updateVoices);
        };
    }, [supportsTts]);

    React.useEffect(() => {
        if (typeof window === 'undefined') return;

        window.localStorage.setItem(TTS_SETTINGS_STORAGE_KEY, JSON.stringify(ttsSettings));
    }, [ttsSettings]);

    React.useEffect(() => {
        if (typeof window === 'undefined') return;

        window.localStorage.setItem(CHORD_INSTRUMENT_STORAGE_KEY, chordInstrumentId);
    }, [chordInstrumentId]);

    React.useEffect(() => {
        return () => {
            stopPlayback('reset');
            chordInstrumentRef.current?.dispose();
            metronomeSynthRef.current?.dispose();
            cancelSpeechSynthesis();
        };
    }, [stopPlayback]);

    React.useEffect(() => {
        if (!isPlaying) return;

        if (chordInstrumentRef.current) chordInstrumentRef.current.volume.value = chordsVolume;
    }, [chordsVolume, isPlaying]);

    React.useEffect(() => {
        if (!isPlaying) return;

        if (metronomeSynthRef.current) metronomeSynthRef.current.volume.value = metronomeVolume;
    }, [metronomeVolume, isPlaying]);

    function handleStartClick() {
        startPlayback(0);
    }

    function handleStopClick() {
        if (!isPlaying) return;
        stopPlayback('pause');
        // Snap to the nearest past beat boundary so the metronome stays in sync on resume.
        pausedAtRef.current = Math.floor(pausedAtRef.current / beatDurationSeconds) * beatDurationSeconds;
    }

    function handleResumeClick() {
        if (!isPaused) return;
        startPlayback(pausedAtRef.current);
    }

    function handlePresetProgressionChange(nextProgressionId: string) {
        const nextProgression = COMMON_PROGRESSIONS.find(item => item.id === nextProgressionId) || COMMON_PROGRESSIONS[0];
        setProgressionId(nextProgression.id);
        setUseCustomProgression(false);
        setCustomProgressionError('');

        pushHistoryEntry({
            key: `${scaleName}|${nextProgression.numerals.join('-')}`,
            label: `${scaleName} · ${nextProgression.label}`,
            numerals: nextProgression.numerals,
        });
    }

    function handleApplyCustomProgression() {
        const parsedNumerals = parseProgressionText(customProgressionText);
        if (!parsedNumerals.length) {
            setCustomProgressionError('Enter Roman numerals like: i-VII-VI-V or I V vi IV');
            return;
        }

        setCustomProgressionError('');
        setUseCustomProgression(true);

        pushHistoryEntry({
            key: `${scaleName}|${parsedNumerals.join('-')}`,
            label: `${scaleName} · Custom: ${parsedNumerals.join('-')}`,
            numerals: parsedNumerals,
        });
    }

    function handleHistorySelect(entry: ProgressionHistoryEntry) {
        setCustomProgressionText(entry.numerals.join('-'));
        setCustomProgressionError('');
        setUseCustomProgression(true);
        pushHistoryEntry(entry);
    }

    React.useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            if (e.code !== 'Space') return;
            // avoid triggering when focus is on a form element
            const tag = (e.target as HTMLElement).tagName;
            if (tag === 'INPUT' || tag === 'SELECT' || tag === 'BUTTON' || tag === 'TEXTAREA') return;
            e.preventDefault();
            if (isPlaying) {
                handleStopClick();
            } else if (isPaused) {
                handleResumeClick();
            } else {
                handleStartClick();
            }
        }
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [isPlaying, isPaused, beatDurationSeconds]);

    const displayActiveChordIndex = React.useMemo(() => {
        if (!isPlaying || !progressionDisplayBlocks.length) return -1;
        return activeChordIndex;
    }, [activeChordIndex, isPlaying, progressionDisplayBlocks.length]);

    const controlsModel: TrainerControlsPanelModel = {
        isPlaying,
        isPaused,
        isInstrumentLoading,
        instrumentError,
        supportsTts,
        scaleName,
        progressionId,
        progressionsByGroup,
        displayMode,
        randomBlocksCount,
        patternId,
        chordInstrumentId,
        bpm,
        beatsPerChord,
        chordsVolume,
        metronomeVolume,
        withMetronome,
        withLoop,
        ttsSettings,
        ttsVoices,
        beatDurationSeconds,
        progressionDurationSeconds,
        customProgressionText,
        customProgressionError,
        useCustomProgression,
        chordMods,
        progressionHistory,
        activeProgressionKey,
    };

    const controlsSetters: TrainerControlsPanelSetters = {
        setScaleName,
        setDisplayMode,
        setRandomBlocksCount,
        setPatternId,
        setChordInstrumentId,
        setBpm,
        setBeatsPerChord,
        setChordsVolume,
        setMetronomeVolume,
        setWithMetronome,
        setWithLoop,
        setTtsSettings,
        setInstrumentError,
        setCustomProgressionText,
        setCustomProgressionError,
        setUseCustomProgression,
        setChordMods,
    };

    const controlsRuntime: TrainerControlsPanelRuntime = {
        chordPartRef,
        markerSequenceRef,
        metronomeLoopRef,
        metronomeSynthRef,
        stopEventIdRef,
    };

    return (
        <Wrapper>
            <h2>Chord Progressions Trainer</h2>

            <TrainerControlsPanel
                model={controlsModel}
                setters={controlsSetters}
                runtime={controlsRuntime}
                actions={{
                    stopPlayback,
                    onStart: handleStartClick,
                    onResume: handleResumeClick,
                    onStop: handleStopClick,
                    onSelectPresetProgression: handlePresetProgressionChange,
                    onApplyCustomProgression: handleApplyCustomProgression,
                    onSelectHistory: handleHistorySelect,
                    onGenerateRandomBlocks: regenerateRandomBlocks,
                }}
            />

            <TrainerStatusPanel
                numerals={playbackNumerals}
                chords={playbackChords}
                isPlaying={isPlaying}
                isPaused={isPaused}
                playProgress={playProgress}
            />

            <TrainerProgressGrid
                blocks={progressionDisplayBlocks}
                activeChordIndex={displayActiveChordIndex}
                playProgress={playProgress}
            />
        </Wrapper>
    );
});
