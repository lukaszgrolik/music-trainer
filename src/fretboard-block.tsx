import * as React from 'react';
import { observer } from "mobx-react-lite";

import { Fretboard } from './lib/fretboard/fretboard';

export const FretboardBlock: React.FunctionComponent<{model: Fretboard}> = observer(({model}) => {
    const root = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (root.current) model.render(root.current);
    }, []);

    return (
        <div ref={root}>

        </div>
    );
});