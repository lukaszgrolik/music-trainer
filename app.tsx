import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter, Link, NavLink, Route, Switch } from 'react-router-dom';
import * as Tonal from '@tonaljs/tonal';

(window as any).__debug = {
    Tonal,
};

import * as Store from './src/store';
import { MainView } from './src/views/main-view/main-view';
import { ProgressionsView } from './src/views/progressions-view/progressions-view';

const store = new Store.Store();

const data = store.storage.load();
store.latestScales = data.latestScales;

if (data.latestScales.length) store.scaleName = data.latestScales[0];

const app = (
    <BrowserRouter>
        <ul>
            <NavLink activeStyle={{ fontWeight: 'bold' }} exact to="/">Home</NavLink>
            <NavLink activeStyle={{ fontWeight: 'bold' }} to="/progressions">Progressions</NavLink>
        </ul>

        <Switch>
            <Route path="/" exact={true}>
                <MainView store={store} />
            </Route>

            <Route path="/progressions">
                <ProgressionsView />
            </Route>
        </Switch>
    </BrowserRouter>
);

ReactDOM.render(app, document.getElementById('react-root'));