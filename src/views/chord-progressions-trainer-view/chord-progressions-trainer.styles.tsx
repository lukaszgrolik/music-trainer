import styled from '@emotion/styled';

export const Wrapper = styled.div`
    --bg: #f2f6fb;
    --panel: #ffffff;
    --border: #bfd2ea;
    --text: #10253d;
    --muted: #506985;
    --accent: #1d74d8;
    --accent-dark: #0d58ad;
    --danger: #b72525;

    font-family: 'Trebuchet MS', 'Segoe UI', sans-serif;
    color: var(--text);
    background: radial-gradient(circle at top left, #ffffff 0%, #eef5ff 40%, #e8f0fb 100%);
    border: 1px solid var(--border);
    border-radius: 14px;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    padding: 1.25rem;
`;

export const ControlsRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: .85rem;
`;

export const Panel = styled.div`
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: .85rem;
    box-shadow: 0 6px 20px rgba(10, 55, 102, .08);
`;

export const Field = styled.label`
    display: flex;
    flex-direction: column;
    gap: .35rem;
    min-width: 128px;

    > span {
        color: var(--muted);
        font-size: .8rem;
        letter-spacing: .03em;
        text-transform: uppercase;
    }
`;

export const InputBase = styled.input`
    border: 1px solid var(--border);
    border-radius: 8px;
    background: #fff;
    padding: .45rem .5rem;
    font-size: .95rem;
    min-height: 36px;

    &:focus {
        outline: 2px solid rgba(29, 116, 216, .3);
        border-color: var(--accent);
    }
`;

export const SelectBase = styled.select`
    border: 1px solid var(--border);
    border-radius: 8px;
    background: #fff;
    padding: .45rem .5rem;
    font-size: .95rem;
    min-height: 36px;

    &:focus {
        outline: 2px solid rgba(29, 116, 216, .3);
        border-color: var(--accent);
    }
`;

export const CheckboxInput = styled.input`
    appearance: none;
    -webkit-appearance: none;
    display: inline-grid;
    place-content: center;
    width: 20px;
    height: 20px;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: #fff;
    cursor: pointer;

    &::after {
        content: '✓';
        font-size: 13px;
        color: #fff;
        transform: scale(0);
        transition: transform .1s ease;
    }

    &:checked {
        background: var(--accent);
        border-color: var(--accent-dark);
    }

    &:checked::after {
        transform: scale(1);
    }

    &:focus {
        outline: 2px solid rgba(29, 116, 216, .3);
    }

    &:disabled {
        opacity: .5;
        cursor: not-allowed;
    }
`;

export const CheckField = styled.label`
    display: flex;
    align-items: center;
    gap: .5rem;
    min-height: 36px;
    padding: .45rem .55rem;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: #fff;
    color: var(--text);
    font-size: .92rem;
`;

export const RangeInput = styled.input`
    -webkit-appearance: none;
    appearance: none;
    display: block;
    width: 100%;
    height: 36px;
    background: transparent;
    cursor: pointer;

    &::-webkit-slider-runnable-track {
        height: 4px;
        background: #d0deef;
        border-radius: 2px;
    }

    &::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: var(--accent);
        border: 2px solid #fff;
        box-shadow: 0 0 0 1px var(--border);
        margin-top: -6px;
        cursor: grab;
    }

    &:focus {
        outline: none;
    }

    &:focus::-webkit-slider-thumb {
        box-shadow: 0 0 0 3px rgba(29, 116, 216, .3);
    }

    &::-moz-range-track {
        height: 4px;
        background: #d0deef;
        border-radius: 2px;
    }

    &::-moz-range-thumb {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: var(--accent);
        border: 2px solid #fff;
        box-shadow: 0 0 0 1px var(--border);
    }
`;

export const SliderTrackWrapper = styled.div`
    position: relative;
    padding-bottom: 10px;
`;

export const ZeroMarker = styled.span<{ percent: number }>`
    position: absolute;
    bottom: 0;
    left: calc(${props => props.percent}% - 1px);
    width: 2px;
    height: 7px;
    background: var(--muted);
    border-radius: 1px;
    pointer-events: none;
`;

export const ButtonRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: .5rem;
`;

export const Button = styled.button<{ variant?: 'primary' | 'neutral' | 'danger' }>`
    border: 1px solid transparent;
    border-radius: 9px;
    padding: .5rem .8rem;
    font-weight: 700;
    letter-spacing: .01em;
    cursor: pointer;
    transition: transform .08s ease, filter .18s ease;

    ${props => {
        const variant = props.variant || 'neutral';

        if (variant === 'primary') {
            return `
                color: #fff;
                background: linear-gradient(180deg, var(--accent), var(--accent-dark));
            `;
        }

        if (variant === 'danger') {
            return `
                color: #fff;
                background: linear-gradient(180deg, #d74040, var(--danger));
            `;
        }

        return `
            color: var(--text);
            border-color: var(--border);
            background: #fff;
        `;
    }}

    &:hover {
        filter: brightness(1.02);
    }

    &:active {
        transform: translateY(1px);
    }

    &:disabled {
        opacity: .55;
        cursor: not-allowed;
    }
`;

export const ProgressWrapper = styled.div`
    position: relative;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: #fff;
    padding: .6rem;
    overflow: hidden;
`;

export const ProgressBlocks = styled.div`
    position: relative;
    display: grid;
    grid-template-columns: repeat(var(--blocks-count, 4), minmax(0, 1fr));
    gap: .5rem;
`;

export const ProgressBlock = styled.div<{ active: boolean }>`
    border: 1px solid ${props => props.active ? '#64a0df' : '#d0deef'};
    background: ${props => props.active ? '#e8f2ff' : '#f8fbff'};
    min-height: 5rem;
    border-radius: 10px;
    padding: .65rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: .3rem;
`;

export const BlockNumeral = styled.div`
    font-family: Consolas, monospace;
    font-size: 1.05rem;
    font-weight: 700;
`;

export const BlockChord = styled.div`
    color: var(--muted);
    font-size: .93rem;
`;

export const Playhead = styled.div<{ progress: number }>`
    position: absolute;
    top: .35rem;
    bottom: .35rem;
    width: 3px;
    border-radius: 10px;
    background: #e02626;
    box-shadow: 0 0 14px rgba(224, 38, 38, .35);
    left: calc(${props => Math.max(0, Math.min(1, props.progress)) * 100}% - 1.5px);
    pointer-events: none;
`;

export const Summary = styled.div`
    display: flex;
    flex-direction: column;
    gap: .35rem;
    color: var(--muted);
`;

export const HistoryList = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: .35rem;
`;

export const HistoryItemButton = styled.button<{ active: boolean }>`
    border: 1px solid ${props => props.active ? '#64a0df' : '#d0deef'};
    border-radius: 999px;
    background: ${props => props.active ? '#e8f2ff' : '#fff'};
    color: var(--text);
    padding: .3rem .65rem;
    font-size: .85rem;
    cursor: pointer;

    &:hover {
        border-color: #64a0df;
    }
`;
