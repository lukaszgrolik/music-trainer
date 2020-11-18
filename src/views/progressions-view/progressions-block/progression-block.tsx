import * as React from 'react';
import { action, makeObservable, observable } from 'mobx';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import {css} from '@emotion/react';
import * as Tonal from '@tonaljs/tonal';
import * as Tone from 'tone';

import * as utils from '../../../utils';
import * as ProgData from './progressions-data';
import { ProgressionsControl } from './progressions-control';
import { ProgressionControl } from './progression-control';
import { ProgressionChordBlock } from './progression-chord-block';
import { ScaleBlock, ScalesList } from './scales-list';

const Wrapper = styled.div`
    border: 1px solid #ddd;
    padding: .5em;
    margin-bottom: .5em;
`;
const borderColor = '#bbb';
const ProgressionChordCard = styled.div<{active: boolean}>`
    border: 1px solid ${borderColor};
    ${props => props.active && css`background-color: #eee;`}

    > * {
        padding: .25em .5em;
    }

    > * + * {
        border-top: 1px solid ${borderColor};
    }
`;

interface Props {
    prog: ProgData.ProgressionItem;
    progressionsControl: ProgressionsControl;
}

export const ProgressionBlock: React.FunctionComponent<Props> = observer(({ prog, progressionsControl }) => {
    const [key, setKey] = React.useState(utils.randomSample(ProgData.keys));
    const [progression, setProgression] = React.useState<ProgressionControl | null>(null);

    React.useEffect(() => {
        setKey(utils.randomSample(ProgData.keys));
        if (!key) throw new Error('key is invalid');

        setProgression(new ProgressionControl(progressionsControl, key, prog));
    }, [prog]);

    if (!progression) return null;

    return (
        <Wrapper>
            <div>
                <div style={{ fontWeight: 'bold' }}>
                    <span>{key} {progression.chords.join('-')} ({progression.tonalChords.join('-')})</span>

                    <button onClick={() => progression.playProgression()}>{progression.isPlaying ? 'stop' : 'play'}</button>
                    {/* <span>{progression.activeChordIndex}</span> */}

                    <input
                        type="number"
                        value={progression.chordDuration}
                        onChange={e => progression.setChordDuration(e.currentTarget.valueAsNumber)}
                        style={{width: 30}}
                    />

                    {/* option: loop */}
                </div>

                <div>{progression.progInfo.name || 'unnamed'}{progression.progInfo.info ? ` | ${progression.progInfo.info}` : ''}</div>

                {
                    progressionsControl.showScales
                    &&
                    <ScalesList style={{ fontSize: '.8em' }}>
                        {
                            progression.sharedScales.filter(s => ProgData.visibleScales.includes(s)).map((s, i) => {
                                return (
                                    <ScaleBlock key={i}>{s}</ScaleBlock>
                                );
                            })
                        }
                    </ScalesList>
                }
            </div>

            <table>
                <thead>
                    <tr>
                        {
                            progression.tonalChords.map((chord, i) => {
                                return (
                                    <th key={i}>
                                        <ProgressionChordCard active={i === progression.activeChordIndex}>
                                            <div>{progression.chords[i]}</div>
                                            <div>{chord}</div>
                                        </ProgressionChordCard>
                                    </th>
                                );
                            })
                        }
                    </tr>
                </thead>

                <tbody>
                    <tr>
                        {
                            progression.tonalChords.map((chord, i) => {
                                return <td key={i}>
                                    <ProgressionChordBlock chord={chord} progressionsControl={progressionsControl} />
                                </td>
                            })
                        }
                    </tr>
                </tbody>
            </table>
        </Wrapper>
    );
});