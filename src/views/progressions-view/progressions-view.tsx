import * as React from 'react';
import { action } from 'mobx';
import { observer } from "mobx-react-lite";
import * as Tonal from '@tonaljs/tonal';

import { ProgressionsBlock } from './progressions-block/progressions-block';

export const ProgressionsView: React.FC = observer(() => {
    return (
        <div>
            <ProgressionsBlock />
        </div>
    );
});