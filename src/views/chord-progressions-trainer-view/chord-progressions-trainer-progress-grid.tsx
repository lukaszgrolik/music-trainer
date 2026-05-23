import * as React from 'react';

import {
    BlockChord,
    BlockNumeral,
    Playhead,
    ProgressBlock,
    ProgressBlocks,
    ProgressWrapper,
} from './chord-progressions-trainer.styles';
import { ProgressionDisplayBlock } from './chord-progressions-trainer.types';

type TrainerProgressGridProps = {
    blocks: ProgressionDisplayBlock[];
    activeChordIndex: number;
    playProgress: number;
};

export const TrainerProgressGrid: React.FC<TrainerProgressGridProps> = props => {
    return (
        <ProgressWrapper>
            <ProgressBlocks style={{ ['--blocks-count' as any]: props.blocks.length }}>
                {
                    props.blocks.map((block, index) => {
                        return (
                            <ProgressBlock key={index} active={props.activeChordIndex === index}>
                                <BlockNumeral>{block.numeral}</BlockNumeral>
                                <BlockChord>{block.chord}</BlockChord>
                            </ProgressBlock>
                        );
                    })
                }
            </ProgressBlocks>

            <Playhead progress={props.playProgress} />
        </ProgressWrapper>
    );
};
