import * as React from 'react';
import * as Tone from 'tone';

import {
    CHORD_MOD_OPTIONS,
    CHORD_INSTRUMENT_OPTIONS,
    DISPLAY_MODE_OPTIONS,
    PATTERN_OPTIONS,
    SCALE_OPTIONS,
} from './chord-progressions-trainer.constants';
import {
    Button,
    ButtonRow,
    CheckField,
    CheckboxInput,
    ControlsRow,
    Field,
    InputBase,
    Panel,
    RangeInput,
    SelectBase,
    SliderTrackWrapper,
    Summary,
    HistoryItemButton,
    HistoryList,
    ZeroMarker,
} from './chord-progressions-trainer.styles';
import {
    ChordInstrumentId,
    ChordModId,
    ChordModSettings,
    PatternId,
    PatternNoteEvent,
    ProgressionDisplayMode,
    ProgressionHistoryEntry,
    ProgressionPreset,
    TtsSettings,
} from './chord-progressions-trainer.types';
import { cancelSpeechSynthesis, clamp, formatDb } from './chord-progressions-trainer.utils';

export type TrainerControlsPanelModel = {
    isPlaying: boolean;
    isPaused: boolean;
    isInstrumentLoading: boolean;
    instrumentError: string;
    supportsTts: boolean;
    scaleName: string;
    progressionId: string;
    progressionsByGroup: Record<string, ProgressionPreset[]>;
    displayMode: ProgressionDisplayMode;
    randomBlocksCount: number;
    patternId: PatternId;
    chordInstrumentId: ChordInstrumentId;
    bpm: number;
    beatsPerChord: number;
    chordsVolume: number;
    metronomeVolume: number;
    withMetronome: boolean;
    withLoop: boolean;
    ttsSettings: TtsSettings;
    ttsVoices: SpeechSynthesisVoice[];
    beatDurationSeconds: number;
    progressionDurationSeconds: number;
    customProgressionText: string;
    customProgressionError: string;
    useCustomProgression: boolean;
    chordMods: ChordModSettings;
    progressionHistory: ProgressionHistoryEntry[];
    activeProgressionKey: string;
};

export type TrainerControlsPanelSetters = {
    setScaleName: React.Dispatch<React.SetStateAction<string>>;
    setDisplayMode: React.Dispatch<React.SetStateAction<ProgressionDisplayMode>>;
    setRandomBlocksCount: React.Dispatch<React.SetStateAction<number>>;
    setPatternId: React.Dispatch<React.SetStateAction<PatternId>>;
    setChordInstrumentId: React.Dispatch<React.SetStateAction<ChordInstrumentId>>;
    setBpm: React.Dispatch<React.SetStateAction<number>>;
    setBeatsPerChord: React.Dispatch<React.SetStateAction<number>>;
    setChordsVolume: React.Dispatch<React.SetStateAction<number>>;
    setMetronomeVolume: React.Dispatch<React.SetStateAction<number>>;
    setWithMetronome: React.Dispatch<React.SetStateAction<boolean>>;
    setWithLoop: React.Dispatch<React.SetStateAction<boolean>>;
    setTtsSettings: React.Dispatch<React.SetStateAction<TtsSettings>>;
    setInstrumentError: React.Dispatch<React.SetStateAction<string>>;
    setCustomProgressionText: React.Dispatch<React.SetStateAction<string>>;
    setCustomProgressionError: React.Dispatch<React.SetStateAction<string>>;
    setUseCustomProgression: React.Dispatch<React.SetStateAction<boolean>>;
    setChordMods: React.Dispatch<React.SetStateAction<ChordModSettings>>;
};

export type TrainerControlsPanelRuntime = {
    chordPartRef: React.MutableRefObject<Tone.Part<PatternNoteEvent> | null>;
    markerSequenceRef: React.MutableRefObject<Tone.Sequence<number> | null>;
    metronomeLoopRef: React.MutableRefObject<Tone.Loop | null>;
    metronomeSynthRef: React.MutableRefObject<Tone.Synth | null>;
    stopEventIdRef: React.MutableRefObject<number | null>;
};

type TrainerControlsPanelActions = {
    stopPlayback: (mode: 'reset' | 'pause') => void;
    onStart: () => void;
    onResume: () => void;
    onStop: () => void;
    onSelectPresetProgression: (progressionId: string) => void;
    onApplyCustomProgression: () => void;
    onSelectHistory: (entry: ProgressionHistoryEntry) => void;
    onGenerateRandomBlocks: () => void;
};

type TrainerControlsPanelProps = {
    model: TrainerControlsPanelModel;
    setters: TrainerControlsPanelSetters;
    runtime: TrainerControlsPanelRuntime;
    actions: TrainerControlsPanelActions;
};

export const TrainerControlsPanel: React.FC<TrainerControlsPanelProps> = props => {
    const { model, setters, runtime, actions } = props;

    function handleMetronomeToggle(checked: boolean) {
        setters.setWithMetronome(checked);

        if (!model.isPlaying) return;

        if (!checked) {
            runtime.metronomeLoopRef.current?.stop(0);
            runtime.metronomeLoopRef.current?.dispose();
            runtime.metronomeLoopRef.current = null;
            return;
        }

        if (!runtime.metronomeLoopRef.current) {
            let beatCounter = Math.round(Tone.Transport.seconds / model.beatDurationSeconds);
            const loop = new Tone.Loop(time => {
                const isAccent = beatCounter % model.beatsPerChord === 0;
                runtime.metronomeSynthRef.current?.triggerAttackRelease(isAccent ? 'C6' : 'G5', isAccent ? 0.06 : 0.04, time);
                beatCounter += 1;
            }, model.beatDurationSeconds);

            loop.start('+0');
            runtime.metronomeLoopRef.current = loop;
        }
    }

    function handleLoopToggle(checked: boolean) {
        setters.setWithLoop(checked);

        if (!model.isPlaying) return;

        if (runtime.chordPartRef.current) runtime.chordPartRef.current.loop = checked;
        if (runtime.markerSequenceRef.current) runtime.markerSequenceRef.current.loop = checked;

        if (!checked) {
            const elapsed = Tone.Transport.seconds;
            const remaining = Math.max(0.001, model.progressionDurationSeconds - (elapsed % model.progressionDurationSeconds));
            runtime.stopEventIdRef.current = Tone.Transport.scheduleOnce(time => {
                Tone.Draw.schedule(() => actions.stopPlayback('reset'), time);
            }, `+${remaining}`);
            return;
        }

        if (runtime.stopEventIdRef.current !== null) {
            Tone.Transport.clear(runtime.stopEventIdRef.current);
            runtime.stopEventIdRef.current = null;
        }
    }

    function handleTtsEnabledToggle(checked: boolean) {
        setters.setTtsSettings(prev => ({ ...prev, enabled: checked }));
        if (!checked) cancelSpeechSynthesis();
    }

    function handleChordInstrumentIdChange(nextInstrumentId: ChordInstrumentId) {
        setters.setChordInstrumentId(nextInstrumentId);
        setters.setInstrumentError('');
    }

    function handleChordModToggle(modId: ChordModId, checked: boolean) {
        setters.setChordMods(prev => ({ ...prev, [modId]: checked }));
    }

    return (
        <Panel>
            <ControlsRow>
                <Field>
                    <span>Scale</span>
                    <SelectBase
                        disabled={model.isPlaying}
                        value={model.scaleName}
                        onChange={e => setters.setScaleName(e.currentTarget.value)}
                    >
                        {
                            SCALE_OPTIONS.map(scale => {
                                return <option key={scale} value={scale}>{scale}</option>;
                            })
                        }
                    </SelectBase>
                </Field>

                <Field>
                    <span>Chord Progression</span>
                    <SelectBase
                        disabled={model.isPlaying}
                        value={model.progressionId}
                        onChange={e => actions.onSelectPresetProgression(e.currentTarget.value)}
                    >
                        {
                            Object.entries(model.progressionsByGroup).map(([group, progressions]) => {
                                return (
                                    <optgroup key={group} label={group}>
                                        {
                                            progressions.map(prog => {
                                                return <option key={prog.id} value={prog.id}>{prog.label}</option>;
                                            })
                                        }
                                    </optgroup>
                                );
                            })
                        }
                    </SelectBase>
                </Field>

                <Field>
                    <span>Display Mode</span>
                    <SelectBase
                        disabled={model.isPlaying}
                        value={model.displayMode}
                        onChange={e => setters.setDisplayMode(e.currentTarget.value as ProgressionDisplayMode)}
                    >
                        {
                            DISPLAY_MODE_OPTIONS.map(mode => {
                                return <option key={mode.id} value={mode.id}>{mode.label}</option>;
                            })
                        }
                    </SelectBase>
                </Field>

                {
                    model.displayMode === 'random' && (
                        <>
                            <Field>
                                <span>Random Blocks</span>
                                <InputBase
                                    type="number"
                                    min={1}
                                    max={64}
                                    disabled={model.isPlaying}
                                    value={model.randomBlocksCount}
                                    onChange={e => {
                                        const value = e.currentTarget.valueAsNumber;
                                        if (!Number.isFinite(value)) return;
                                        setters.setRandomBlocksCount(Math.max(1, Math.min(64, Math.round(value))));
                                    }}
                                    style={{ width: 96 }}
                                />
                            </Field>

                            <Button
                                variant="neutral"
                                disabled={model.isPlaying}
                                onClick={actions.onGenerateRandomBlocks}
                            >
                                Generate Random Blocks
                            </Button>
                        </>
                    )
                }

                <Field style={{ minWidth: 240, flex: 1 }}>
                    <span>Custom Progression (Roman Numerals)</span>
                    <InputBase
                        type="text"
                        placeholder="i-VII-VI-V"
                        disabled={model.isPlaying}
                        value={model.customProgressionText}
                        onChange={e => {
                            setters.setCustomProgressionText(e.currentTarget.value);
                            setters.setCustomProgressionError('');
                        }}
                    />
                </Field>

                <Button
                    variant={model.useCustomProgression ? 'primary' : 'neutral'}
                    disabled={model.isPlaying}
                    onClick={actions.onApplyCustomProgression}
                >
                    Use Custom
                </Button>

                <Field>
                    <span>Pattern</span>
                    <SelectBase
                        disabled={model.isPlaying}
                        value={model.patternId}
                        onChange={e => setters.setPatternId(e.currentTarget.value as PatternId)}
                    >
                        {
                            PATTERN_OPTIONS.map(pattern => {
                                return <option key={pattern.id} value={pattern.id}>{pattern.label}</option>;
                            })
                        }
                    </SelectBase>
                </Field>

                <Field>
                    <span>Instrument</span>
                    <SelectBase
                        disabled={model.isPlaying || model.isInstrumentLoading}
                        value={model.chordInstrumentId}
                        onChange={e => handleChordInstrumentIdChange(e.currentTarget.value as ChordInstrumentId)}
                    >
                        {
                            CHORD_INSTRUMENT_OPTIONS.map(option => {
                                return <option key={option.id} value={option.id}>{option.label}</option>;
                            })
                        }
                    </SelectBase>
                </Field>

                <Field>
                    <span>BPM</span>
                    <InputBase
                        type="number"
                        min={40}
                        max={240}
                        value={model.bpm}
                        onChange={e => {
                            const value = e.currentTarget.valueAsNumber;
                            if (!Number.isFinite(value)) return;
                            setters.setBpm(Math.max(40, Math.min(240, value)));
                        }}
                        style={{ width: 84 }}
                    />
                </Field>

                <Field>
                    <span>Beats / Chord</span>
                    <InputBase
                        type="number"
                        min={2}
                        max={8}
                        value={model.beatsPerChord}
                        onChange={e => {
                            const value = e.currentTarget.valueAsNumber;
                            if (!Number.isFinite(value)) return;
                            setters.setBeatsPerChord(Math.max(2, Math.min(8, Math.round(value))));
                        }}
                        style={{ width: 84 }}
                    />
                </Field>

                <Field>
                    <span>Chord Vol: {formatDb(model.chordsVolume)}</span>
                    <SliderTrackWrapper>
                        <RangeInput
                            type="range"
                            min={-30}
                            max={6}
                            value={model.chordsVolume}
                            onChange={e => setters.setChordsVolume(e.currentTarget.valueAsNumber || 0)}
                        />
                        <ZeroMarker percent={(0 - (-30)) / (6 - (-30)) * 100} />
                    </SliderTrackWrapper>
                </Field>

                <Field>
                    <span>Metronome Vol: {formatDb(model.metronomeVolume)}</span>
                    <SliderTrackWrapper>
                        <RangeInput
                            type="range"
                            min={-36}
                            max={0}
                            value={model.metronomeVolume}
                            onChange={e => setters.setMetronomeVolume(e.currentTarget.valueAsNumber || 0)}
                        />
                        <ZeroMarker percent={100} />
                    </SliderTrackWrapper>
                </Field>

                <CheckField>
                    <CheckboxInput
                        type="checkbox"
                        checked={model.withMetronome}
                        onChange={e => handleMetronomeToggle(e.currentTarget.checked)}
                    />
                    <span>Metronome</span>
                </CheckField>

                <CheckField>
                    <CheckboxInput
                        type="checkbox"
                        checked={model.withLoop}
                        onChange={e => handleLoopToggle(e.currentTarget.checked)}
                    />
                    <span>Loop</span>
                </CheckField>

                {
                    CHORD_MOD_OPTIONS.map(option => {
                        return (
                            <CheckField key={option.id}>
                                <CheckboxInput
                                    type="checkbox"
                                    disabled={model.isPlaying}
                                    checked={Boolean(model.chordMods[option.id])}
                                    onChange={e => handleChordModToggle(option.id, e.currentTarget.checked)}
                                />
                                <span>{option.label}</span>
                            </CheckField>
                        );
                    })
                }

                <CheckField>
                    <CheckboxInput
                        type="checkbox"
                        disabled={!model.supportsTts}
                        checked={model.ttsSettings.enabled && model.supportsTts}
                        onChange={e => handleTtsEnabledToggle(e.currentTarget.checked)}
                    />
                    <span>TTS (Chord Calls)</span>
                </CheckField>

                <Field>
                    <span>TTS Volume: {Math.round(model.ttsSettings.volume * 100)}%</span>
                    <RangeInput
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        disabled={!model.supportsTts || !model.ttsSettings.enabled}
                        value={model.ttsSettings.volume}
                        onChange={e => {
                            const value = Number(e.currentTarget.value);
                            setters.setTtsSettings(prev => ({ ...prev, volume: clamp(value, 0, 1) }));
                        }}
                    />
                </Field>

                <Field>
                    <span>TTS Speed: {model.ttsSettings.rate.toFixed(2)}x</span>
                    <RangeInput
                        type="range"
                        min={0.5}
                        max={2}
                        step={0.05}
                        disabled={!model.supportsTts || !model.ttsSettings.enabled}
                        value={model.ttsSettings.rate}
                        onChange={e => {
                            const value = Number(e.currentTarget.value);
                            setters.setTtsSettings(prev => ({ ...prev, rate: clamp(value, 0.5, 2) }));
                        }}
                    />
                </Field>

                <Field>
                    <span>TTS Voice</span>
                    <SelectBase
                        disabled={!model.supportsTts || !model.ttsSettings.enabled}
                        value={model.ttsSettings.voiceURI}
                        onChange={e => {
                            const nextVoiceURI = e.currentTarget.value;
                            setters.setTtsSettings(prev => ({ ...prev, voiceURI: nextVoiceURI }));
                        }}
                    >
                        <option value="">System Default</option>
                        {
                            model.ttsVoices.map(voice => {
                                const label = `${voice.name} (${voice.lang})${voice.default ? ' - default' : ''}`;
                                return <option key={voice.voiceURI} value={voice.voiceURI}>{label}</option>;
                            })
                        }
                    </SelectBase>
                </Field>

                <Field>
                    <span>TTS Lead Time</span>
                    <SelectBase
                        disabled={!model.supportsTts || !model.ttsSettings.enabled}
                        value={String(model.ttsSettings.leadBeats)}
                        onChange={e => {
                            const nextLeadBeats = clamp(Number(e.currentTarget.value) || 1, 1, 2);
                            setters.setTtsSettings(prev => ({ ...prev, leadBeats: nextLeadBeats }));
                        }}
                    >
                        <option value="1">1 beat before</option>
                        <option value="2">2 beats before</option>
                    </SelectBase>
                </Field>
            </ControlsRow>

            <ControlsRow>
                <ButtonRow>
                    <Button variant="primary" disabled={model.isPlaying || model.isInstrumentLoading} onClick={actions.onStart}>Start</Button>
                    <Button variant="neutral" disabled={!model.isPaused || model.isPlaying} onClick={actions.onResume}>Resume</Button>
                    <Button variant="danger" disabled={!model.isPlaying} onClick={actions.onStop}>Stop</Button>
                </ButtonRow>
            </ControlsRow>

            {
                model.isInstrumentLoading && (
                    <Summary>
                        <div><strong>Instrument:</strong> Loading samples...</div>
                    </Summary>
                )
            }

            {
                model.instrumentError && (
                    <Summary>
                        <div style={{ color: '#b72525' }}><strong>Instrument Error:</strong> {model.instrumentError}</div>
                    </Summary>
                )
            }

            {
                model.customProgressionError && (
                    <Summary>
                        <div style={{ color: '#b72525' }}><strong>Custom Progression:</strong> {model.customProgressionError}</div>
                    </Summary>
                )
            }

            <Summary>
                <div><strong>History:</strong> Click an entry to make it active.</div>
                <HistoryList>
                    {
                        model.progressionHistory.map(entry => {
                            return (
                                <HistoryItemButton
                                    key={entry.key}
                                    type="button"
                                    active={entry.key === model.activeProgressionKey}
                                    onClick={() => actions.onSelectHistory(entry)}
                                >
                                    {entry.label}
                                </HistoryItemButton>
                            );
                        })
                    }
                </HistoryList>
            </Summary>
        </Panel>
    );
};
