import * as React from 'react';
import { action } from 'mobx';
import { observer } from "mobx-react-lite";
import * as Tonal from '@tonaljs/tonal';

import * as Store from '../../store';

interface Props {
    store: Store.Store;
    onScaleChange: (scaleName: string) => void;
}

export const ScaleFormBlock: React.FunctionComponent<Props> = observer(({store, onScaleChange}) => {
    const [scaleName, setScaleName] = React.useState<string>(store.scaleName);
    const [notes, setNotes] = React.useState<string[]>([]);

    React.useEffect(() => {
        setNotes(Store.scaleNotes(scaleName));
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
        <div>
            <form onSubmit={onScaleSubmit}>
                <input type="text" value={scaleName} onChange={onScaleNameChange} />
                <button>send</button>

                <div>{notes.join(', ')}</div>
            </form>

            <ul>
                {
                    store.latestScales.map(scale => {
                        return (
                            <li key={scale}>
                                <span style={{fontWeight: scale === scaleName ? 'bold' : 'normal'}} onClick={onScaleNameClick(scale)}>{scale}</span>
                            </li>
                        );
                    })
                }
            </ul>
        </div>
    );
});