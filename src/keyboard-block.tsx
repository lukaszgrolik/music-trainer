import * as React from 'react';
import { observer } from "mobx-react-lite";

import { Keyboard } from './lib/keyboard/keyboard';

export const KeyboardBlock: React.FunctionComponent<{model: Keyboard}> = observer(({model}) => {
    const root = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (root.current) model.render(root.current);
    }, []);

    return (
        <div ref={root}>

        </div>
    );
});