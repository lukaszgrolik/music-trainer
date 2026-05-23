import * as React from 'react';
import { observer } from 'mobx-react-lite';
import * as Tonal from '@tonaljs/tonal';
import styled from '@emotion/styled';

import { Store } from '../../store';


const Table = styled.table`
    /* background: silver; */
    /* line-height: 1.4; */
    th {
        font-weight: bold;
        text-align: center;
    }

    td, th {
        padding: .25em .5em;
    }
`;

export const ChordsTable: React.FunctionComponent<{store: Store}> = observer(({store}) => {
    const modes = Tonal.Scale.modeNames(store.scaleName);
    const data = modes.map(m => {
        const scaleName = m.join(' ');
        return [scaleName, Tonal.Scale.scaleChords(scaleName)];
    });

    const style = {
        fontFamily: 'Consolas, monospace',
        // 'font-size': '1.2em',
        lineHeight: 1,
    };

    return (
        <div style={style}>
            <Table>
                <thead>
                    <tr>
                        <th></th>
                        <th>note</th>
                        <th>mode</th>
                        <th>aliases</th>
                        <th>chords</th>
                    </tr>
                </thead>

                <tbody>
                    {
                        data.map((mode, i) => {
                            const matchMode = () => {
                                if (typeof mode[0] !== 'string') throw new Error();

                                const m = mode[0].match('^([A-G][b#]{0,2}) (.+)$')
                                if (!m) throw new Error();

                                return [m[1], m[2]];
                            };
                            const [noteName, modeName] = matchMode();
                            const scaleName = `${noteName} ${modeName}`;
                            const getScaleChords = () => {
                                const chords = mode[1];
                                if (chords instanceof Array) {
                                    return chords.map(m => {
                                        if (typeof m !== 'string') throw new Error();
                                        return m;
                                    });
                                }

                                throw new Error();
                            };
                            const scaleChords = getScaleChords();
                            const sortOrder = ['M', 'm', 'maj7', 'm7', '7', 'dim', 'm7b5', 'dim7', 'aug', 'sus2', 'sus4'];

                            return (
                                <tr key={scaleName}>
                                    <td>#{i + 1}</td>
                                    <th>{noteName}</th>
                                    <th>{modeName}</th>
                                    <td style={{textAlign: 'center'}}>{Tonal.Scale.get(scaleName).aliases.join(', ') || '-'}</td>
                                    <td>
                                        {
                                            scaleChords
                                            .sort((a, b) => {
                                                const x = (i: number) => i === -1 ? 999 : i;

                                                return x(sortOrder.indexOf(a)) - x(sortOrder.indexOf(b));
                                            })
                                            .map(chord => {
                                                // const important1 = ['M', 'm', '7', 'maj7', 'm7'].includes(chord);
                                                // const important2 = ['dim', 'm7b5', 'dim7', 'aug'].includes(chord);
                                                // const important3 = ['sus2', 'sus4'].includes(chord);
                                                // const colors: {[key: string]: Array<string>} = {
                                                const colors: Record<string, string[]> = {
                                                    [`hsl(${360 / 12 * 3}, 50%, 50%)`]: ['m', 'm7'],
                                                    [`hsl(${360 / 12 * 4}, 50%, 50%)`]: ['M', 'maj7', '7'],
                                                    [`hsl(${360 / 12 * 6}, 50%, 50%)`]: ['dim', 'm7b5', 'dim7'],
                                                    [`hsl(${360 / 12 * 8}, 50%, 50%)`]: ['aug'],
                                                    [`hsl(${360 / 12 * 2}, 50%, 50%)`]: ['sus2'],
                                                    [`hsl(${360 / 12 * 5}, 50%, 50%)`]: ['sus4'],
                                                };
                                                const style: React.CSSProperties = {
                                                    // ...((important1 || important2 || important3) ? {
                                                    padding: '.1em .25em',
                                                    display: 'inline-block',
                                                    boxSizing: 'border-box',
                                                    marginRight: '.5em',
                                                    ...(Object.values(colors).flat().includes(chord) ? {
                                                        color: '#fff',
                                                        // 'font-weight': 'bold',
                                                    } : {
                                                        color: 'grey',
                                                        border: '1px solid lightgrey',
                                                    }),

                                                    // ...(important1 && {
                                                    //     background: 'khaki',
                                                    // }),
                                                    // ...(important2 && {
                                                    //     background: 'silver',
                                                    // }),
                                                    // ...(important3 && {
                                                    //     background: 'lightskyblue',
                                                    // }),
                                                };

                                                if (chord.includes('7')) {
                                                    const intervals = {
                                                        'maj7': 11,
                                                        'm7': 10,
                                                        'm7b5': 10,
                                                        '7': 10,
                                                        'dim7': 9,
                                                    };

                                                    style.borderLeft = `.5em solid ${`hsl(${360 / 12 * intervals[chord as keyof typeof intervals]}, 50%, 50%)`}`;
                                                }

                                                for (const c in colors) {
                                                    if (colors[c].includes(chord)) {
                                                        style.backgroundColor = c;
                                                        break;
                                                    }
                                                }

                                                return (
                                                    <span key={chord} style={style}>{chord}</span>
                                                )
                                            })
                                        }
                                    </td>
                                </tr>
                            );
                        })
                    }
                </tbody>
            </Table>
        </div>
    );
});