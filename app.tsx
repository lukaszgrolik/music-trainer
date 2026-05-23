import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Link, NavLink, Route, Routes } from 'react-router-dom';
import * as Tonal from '@tonaljs/tonal';
import * as Tone from 'tone';
import { Global, css } from '@emotion/react';

(window as any).__debug = {
    Tonal,
    Tone,
};

import * as Store from './src/store';
import { MainView } from './src/views/main-view/main-view';
import { ProgressionsView } from './src/views/progressions-view/progressions-view';
import { SequencesView } from './src/views/sequences-view/sequences-view';
import { TrainingView } from './src/views/training-view/training-view';
import { ChordProgressionsTrainerView } from './src/views/chord-progressions-trainer-view/chord-progressions-trainer-view';

const store = new Store.Store();

const data = store.storage.load();
store.latestScales = data.latestScales;

if (data.latestScales.length) store.scaleName = data.latestScales[0];

const cssReset = css`
    *:where(:not(iframe, canvas, img, svg, video):not(svg *)) {
        all: unset;
        display: revert;
    }

    /* Preferred box-sizing value */
    *,
    *::before,
    *::after {
        box-sizing: border-box;
    }

    /*
    Remove list styles (bullets/numbers)
    in case you use it with normalize.css
    */
    ol, ul {
        list-style: none;
    }

    /* For images to not be able to exceed their container */
    img {
        max-width: 100%;
    }

    /* Removes spacing between cells in tables */
    table {
        border-collapse: collapse;
    }

    /* Revert the 'white-space' property for textarea elements on Safari */
    textarea {
        white-space: revert;
    }
`;

const app = (
    <BrowserRouter>
        <Global styles={cssReset} />

        <ul>
            <NavLink style={({ isActive }) => ({ fontWeight: isActive ? 'bold' : 'normal' })} to="/">Home</NavLink>
            <NavLink style={({ isActive }) => ({ fontWeight: isActive ? 'bold' : 'normal' })} to="/progressions">Progressions</NavLink>
            <NavLink style={({ isActive }) => ({ fontWeight: isActive ? 'bold' : 'normal' })} to="/sequences">Sequences</NavLink>
            <NavLink style={({ isActive }) => ({ fontWeight: isActive ? 'bold' : 'normal' })} to="/training">Training</NavLink>
            <NavLink style={({ isActive }) => ({ fontWeight: isActive ? 'bold' : 'normal' })} to="/chord-progressions-trainer">Chord Progressions Trainer</NavLink>
        </ul>
        <Routes>
            <Route path="/" element={<MainView store={store} />} />
            <Route path="/progressions" element={<ProgressionsView />} />
            <Route path="/sequences" element={<SequencesView />} />
            <Route path="/training" element={<TrainingView />} />
            <Route path="/chord-progressions-trainer" element={<ChordProgressionsTrainerView />} />
        </Routes>
    </BrowserRouter>
);

const rootElement = document.getElementById('react-root');

if (rootElement) {
    createRoot(rootElement).render(app);
}