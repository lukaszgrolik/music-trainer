import styled from '@emotion/styled';

const scalesListSpace = '.5em';
export const ScalesList = styled.div`
    display: flex;
    flex-wrap: wrap;
    margin-top: -${scalesListSpace};
    margin-left: -${scalesListSpace};

    > * {
        margin-top: ${scalesListSpace};
        margin-left: ${scalesListSpace};
    }
`;
export const ScaleBlock = styled.div`
    border: 1px solid #ccc;
    padding: .1em .25em;
`;