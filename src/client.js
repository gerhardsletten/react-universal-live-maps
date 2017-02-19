import process from 'process'
import React from 'react'
import ReactDOM from 'react-dom'
import {browserHistory} from 'react-router'
import {syncHistoryWithStore} from 'react-router-redux'

import Root from './Root'
import createStore from './redux/create'
import ApiClient from './helpers/ApiClient'

global.__CLIENT__ = true
global.__SERVER__ = false
global.__DEVELOPMENT__ = process.env.NODE_ENV !== 'production'

const client = new ApiClient()
const dest = document.getElementById('content')
window.store = window.store || createStore(browserHistory, client, window.__data)
const history = syncHistoryWithStore(browserHistory, window.store)

render(Root)

function render (RootElement) {
  ReactDOM.render(
    <RootElement store={window.store} client={client} history={history} />,
    dest
  )
}
