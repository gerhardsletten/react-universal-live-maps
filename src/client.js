import 'babel-polyfill'
import React from 'react'
import ReactDOM from 'react-dom'
import createStore from './redux/create'
import ApiClient from './helpers/ApiClient'
import io from 'socket.io-client'
import {Provider} from 'react-redux'
import {Router, browserHistory} from 'react-router'
import {syncHistoryWithStore} from 'react-router-redux'
import {ReduxAsyncConnect} from 'redux-async-connect'
import getRoutes from './routes'

const client = new ApiClient()
const dest = document.getElementById('content')
const store = createStore(browserHistory, client, window.__data)
const history = syncHistoryWithStore(browserHistory, store)

function initSocket () {
  const socket = io('', {path: '/ws'})
  return socket
}

global.socket = initSocket()

const component = (
  <Router render={(props) =>
    <ReduxAsyncConnect {...props} helpers={{client}} filter={(item) => !item.deferred} />
      } history={history}>
    {getRoutes(store)}
  </Router>
)

ReactDOM.render(
  <Provider store={store} key='provider'>
    {component}
  </Provider>,
  dest
)

if (process.env.NODE_ENV !== 'production') {
  window.React = React // enable debugger

  if (!dest || !dest.firstChild || !dest.firstChild.attributes || !dest.firstChild.attributes['data-react-checksum']) {
    console.error('Server-side React render was discarded. Make sure that your initial render does not contain any client-side code.')
  }
}

if (!window.devToolsExtension) {
  ReactDOM.render(
    <Provider store={store} key='provider'>
      <div>
        {component}
      </div>
    </Provider>,
    dest
  )
}
