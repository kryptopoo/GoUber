import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router'

import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

import Web3 from 'web3';
import Web3Provider from 'react-web3-provider';

import './css/index.css';

import Home from './components/home/Home'
import Start from './components/start/Start'
import Booking from './components/booking/Booking'
import OnTrip from './components/trip/OnTrip'

import * as serviceWorker from './serviceWorker';

const palette = {
  primary: { main: '#424242' },
  secondary: { main: '#BDBDBD' }
};
const themeName = 'Tundora Silver Ostrich';

const theme = createMuiTheme({ palette, themeName });

ReactDOM.render(
  (
    <MuiThemeProvider theme={theme}>
      <Web3Provider 
        defaultProvider={(cb) => cb(new Web3(new Web3.providers.HttpProvider("https://testnet-rpc.gochain.io")))}
        loading="Loading..."
        error={(err) => `Connection error: ${err.message}`}
      >
        <Router history = {browserHistory}>
          <Route path = "/" >
            <IndexRoute component = {Home} />
            <Route path = "home" component = {Home} />
            <Route path = "start" component = {Start} />
            <Route path = "booking" component = {Booking} />
            <Route path = "trip" component = {OnTrip} />
          </Route>
        </Router>
      </Web3Provider>
    </MuiThemeProvider>
  ),
  document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
