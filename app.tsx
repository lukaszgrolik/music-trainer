import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter, Link, NavLink, Route, Switch } from 'react-router-dom';
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
            <NavLink activeStyle={{ fontWeight: 'bold' }} exact to="/">Home</NavLink>
            <NavLink activeStyle={{ fontWeight: 'bold' }} to="/progressions">Progressions</NavLink>
            <NavLink activeStyle={{ fontWeight: 'bold' }} to="/sequences">Sequences</NavLink>
            <NavLink activeStyle={{ fontWeight: 'bold' }} to="/training">Training</NavLink>
        </ul>
        <Switch>
            <Route path="/" exact={true}>
                <MainView store={store} />
            </Route>
            <Route path="/progressions">
                <ProgressionsView />
            </Route>
            <Route path="/sequences">
                <SequencesView />
            </Route>
            <Route path="/training">
                <TrainingView />
            </Route>
        </Switch>
    </BrowserRouter>
);

ReactDOM.render(app, document.getElementById('react-root'));