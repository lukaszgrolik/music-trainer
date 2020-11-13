import * as React from 'react';
import * as ReactDOM from 'react-dom';
// import { BrowserRouter as Router, Route, Link, NavLink } from 'react-router-dom';
import { BrowserRouter, Link, NavLink, Route, Switch } from 'react-router-dom';

// import * as Store from './src/store/store';
// import { LegacyView } from './src/views/legacy-view/legacy-view';
import { MainView } from './src/main-view';
import * as Store from './src/store';
// import { Store } from './src/store/store';


const store = new Store.Store();

const data = store.storage.load();
store.latestScales = data.latestScales;

if (data.latestScales.length) store.scaleName = data.latestScales[0];

const app = (
    <BrowserRouter>
        {/* <ul>
            <NavLink activeStyle={{ fontWeight: 'bold' }} exact to="/">Home</NavLink>
            <NavLink activeStyle={{ fontWeight: 'bold' }} to="/projects">Projects</NavLink>
            <NavLink activeStyle={{ fontWeight: 'bold' }} to="/legacy">Legacy</NavLink>
        </ul>

        <Switch>
            <Route path="/" exact={true}>
                <p>home</p>
            </Route>

            <Route path="/projects">
                <MainView store={store} />
            </Route>

            <Route path="/legacy">
                <LegacyView />
            </Route>
        </Switch> */}
        <MainView store={store} />
    </BrowserRouter>
);

ReactDOM.render(app, document.getElementById('react-root'));