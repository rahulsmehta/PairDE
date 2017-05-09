import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Router, Route, browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import { Provider } from 'react-redux';

import App from './containers/App';
import Login from './containers/Login';
import configureStore from './store';

const store = configureStore();
const history = syncHistoryWithStore(browserHistory, store);

ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      <Route path="/" component={Login}>
      </Route>
      <Route path="/editor" component={App}> </Route>
    </Router>
  </Provider>,
  document.getElementById('root')
);
