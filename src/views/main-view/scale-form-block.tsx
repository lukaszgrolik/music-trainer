import * as React from 'react';
import { action } from 'mobx';
import { observer } from "mobx-react-lite";
import * as Tonal from '@tonaljs/tonal';
import styled from '@emotion/styled';

import * as Store from '../../store';

const Wrapper = styled.div`
    background-color: hsl(240, 10%, 80%);
    padding: 1em;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1em;
`;
const Form = styled.form`
    display: flex;
    gap: 1em;
`;
const Input = styled.input`
    background-color: rgba(255, 255, 255, .66);
    font-size: 1.1em;
    color: rgba(0, 0, 0, .75);
    padding: .5em 1em;
    border: 1px solid rgba(0, 0, 0, .25);
    border-radius: .25em;

    &:focus {
        background-color: rgba(255, 255, 255, .75);
        border-color: dodgerblue;
    }
`;
const Button = styled.button`
    font-size: 1.1em;
    padding: .5em 1em;
    border: 1px solid rgba(0, 0, 0, .25);
    border-radius: .25em;

    [disabled] {
        background-color: rgba(255, 255, 255, .5);
        color: rgba(0, 0, 0, .75);
    }

    &:not([disabled]) {
        cursor: pointer;
        background-color: hsl(210, 66%, 50%);
        color: rgba(255, 255, 255, .75);

        &:hover {
            background-color: hsl(210, 66%, 60%);
        }
    }
`;
const ScalesListWrapper = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: .5em;
`;
const ScalesList = styled.ul`
    display: flex;
    flex-wrap: wrap;
    gap: .5em;
`;
const ScaleBlock = styled.button`
    cursor: pointer;
    background-color: rgba(255, 255, 255, .5);
    padding: .25em .5em;

    &:hover {
        background-color: rgba(255, 255, 255, .75);
    }
`;

interface Props {
    store: Store.Store;
    onScaleChange: (scaleName: string) => void;
}

export const ScaleFormBlock: React.FunctionComponent<Props> = observer(({store, onScaleChange}) => {
    const [scaleName, setScaleName] = React.useState<string>(store.scaleName);
    const [notes, setNotes] = React.useState<string[]>([]);

    const sanitizeScaleName = (scaleName: string) => {
        return scaleName.trim().replace(/ {2,}/g, ' ').toLowerCase();
    };

    React.useEffect(() => {
        setNotes(Store.scaleNotes(sanitizeScaleName(scaleName)));
    }, [scaleName])

    function onScaleNameChange(e: React.FormEvent<HTMLInputElement>) {
        setScaleName(e.currentTarget.value);
    }

    function onScaleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        saveScale(scaleName);
        onScaleChange(scaleName);
    }

    function onScaleNameClick(scaleName: string) {
        return () => {
            setScaleName(scaleName);
            saveScale(scaleName);
            onScaleChange(scaleName);
        };
    }

    const saveScale = action(function saveScale(scaleName: string) {
        store.scaleName = scaleName;

        const updatedLatestScales = [scaleName].concat(store.latestScales.filter(s => s !== scaleName));
        store.latestScales = updatedLatestScales;
        store.storage.save(updatedLatestScales);
    });

    return (
        <Wrapper>
            <Form onSubmit={onScaleSubmit}>
                <Input
                    placeholder="Scale name, e.g. F# minor"
                    type="text"
                    value={scaleName}
                    onChange={onScaleNameChange}
                />

                {
                    notes.length > 0
                    &&
                    <div>
                        <div>Scale found:</div>
                        <div>{notes.join(', ')}</div>
                    </div>
                }

                <Button disabled={notes.length == 0}>Show</Button>
            </Form>

            {
                store.latestScales.length > 0
                &&
                <ScalesListWrapper>
                    <div>recent scales:</div>

                    <ScalesList>
                        {
                            store.latestScales.slice(0, 7).map(scale => {
                                return (
                                    <li key={scale}>
                                        <ScaleBlock
                                            style={{fontWeight: scale === scaleName ? 'bold' : 'normal'}}
                                            onClick={onScaleNameClick(scale)}
                                        >
                                            {scale}
                                        </ScaleBlock>
                                    </li>
                                );
                            })
                        }
                    </ScalesList>
                </ScalesListWrapper>
            }
        </Wrapper>
    );
});