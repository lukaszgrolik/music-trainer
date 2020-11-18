import * as React from 'react';
import styled from '@emotion/styled';
import { action, makeObservable, observable } from 'mobx';
import { observer } from 'mobx-react-lite';
import * as Tonal from '@tonaljs/tonal';
import * as Tone from 'tone';

import * as utils from '../utils';
import { ProgressionBlock } from './progression-block';
import * as ProgData from './progressions-data';
import { ProgressionsControl } from './progressions-control';

function getRandomOpenChords() {
    return utils.randomSamples(ProgData.openChords, ProgData.openChords.length);
}

function getRandomBarChords() {
    return utils.randomSamples(ProgData.barChords, ProgData.barChords.length).map(chord => {
        const letter = utils.randomSample(['A', 'B', 'C', 'D', 'E', 'F', 'G']);
        if (typeof letter !== 'string') throw new Error(`invalid letter: ${letter}`);

        const acc = utils.randomSample(['', 'b', '#']);
        if (typeof acc !== 'string') throw new Error(`invalid accidental: ${acc}`);

        return letter + acc + chord;
    });
}

function getRandomProgressions() {
    return utils.randomSamples(ProgData.progressions, 3);
}

const Header = styled.div`
    > * + * {
        margin-top: 1em;
    }
`;
const ChordsWrapper = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;

    > * + * {
        margin-left: 1em;
    }
`;

const chordsListSpace = '.5em';
const ChordsList = styled.div`
    display: flex;
    flex-wrap: wrap;
    margin-top: -${chordsListSpace};
    margin-left: -${chordsListSpace};

    > * {
        margin-top: ${chordsListSpace};
        margin-left: ${chordsListSpace};
    }
`;
const ChordBlock = styled.div`
    border: 1px solid #ccc;
    padding: .1em .25em;
`;

export const ProgressionsBlock = observer(() => {
    const [randomOpenChords] = React.useState(getRandomOpenChords());
    const [randomBarChords] = React.useState(getRandomBarChords());
    const [randomProgressions] = React.useState(getRandomProgressions());
    const [progressionsControl] = React.useState(new ProgressionsControl());

    const style = {
        fontFamily: 'Consolas, monospace',
        // 'font-size': '1.2em',
        lineHeight: 1,
    };

    return (
        <div style={style}>
            <Header>
                <ChordsWrapper>
                    <div>random open chords:</div>

                    <div>
                        <ChordsList>
                            {
                                randomOpenChords.map(chord => {
                                    return <ChordBlock key={chord}>{chord}</ChordBlock>
                                })
                            }
                        </ChordsList>
                    </div>
                </ChordsWrapper>

                <ChordsWrapper>
                    <div>random bar chords:</div>

                    <div>
                        <ChordsList>
                            {
                                randomBarChords.map(chord => {
                                    return <ChordBlock key={chord}>{chord}</ChordBlock>
                                })
                            }
                        </ChordsList>
                    </div>
                </ChordsWrapper>
            </Header>

            <div>
                <label>
                    <input
                        type="checkbox"
                        checked={progressionsControl.showDiagrams}
                        onChange={e => progressionsControl.setShowDiagrams(e.currentTarget.checked)}
                    />
                    show diagrams
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={progressionsControl.showScales}
                        onChange={e => progressionsControl.setShowScales(e.currentTarget.checked)}
                    />
                    show scales
                </label>
            </div>

            {
                randomProgressions.map((prog, i) => {
                    return (
                        <ProgressionBlock key={i} prog={prog} progressionsControl={progressionsControl} />
                    );
                })
            }
        </div>
    );
});