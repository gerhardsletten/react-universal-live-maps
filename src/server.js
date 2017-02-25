import path from 'path'
import http from 'http'
import Express from 'express'
import favicon from 'serve-favicon'
import compression from 'compression'
import {sync as bundleHasher} from 'md5-file'
import httpProxy from 'http-proxy'
import React from 'react'
import ReactDOM from 'react-dom/server'
import {match} from 'react-router'
import {syncHistoryWithStore} from 'react-router-redux'
import {ReduxAsyncConnect, loadOnServer} from 'redux-connect'
import createHistory from 'react-router/lib/createMemoryHistory'
import {Provider} from 'react-redux'

import Html from './helpers/Html'
import createStore from './redux/create'
import ApiClient from './helpers/ApiClient'
import getRoutes from './routes'
import config from './config'

const targetUrl = 'http://' + config.apiHost + ':' + config.apiPort
const app = new Express()
const server = new http.Server(app)
const proxy = httpProxy.createProxyServer({
  target: targetUrl,
  ws: true,
  changeOrigin: true
})

console.time('bundleHash')

const bundleHash = bundleHasher('static/dist/bundle.js')

console.timeEnd('bundleHash')
console.log(bundleHash)

app.use(compression())
app.use(favicon(path.join(__dirname, '..', 'static', 'favicon.ico')))
app.use(Express.static(path.join(__dirname, '..', 'static')))

app.use('/api', (req, res) => {
  proxy.web(req, res, {target: targetUrl})
})

app.use('/ws', (req, res) => {
  console.log('Init WS conneciton')
  proxy.web(req, res, {target: targetUrl + '/ws'})
})

server.on('upgrade', (req, socket, head) => {
  console.log('upgrading WS conneciton')
  proxy.ws(req, socket, head)
})

// added the error handling to avoid https://github.com/nodejitsu/node-http-proxy/issues/527
proxy.on('error', (error, req, res) => {
  let json
  if (error.code !== 'ECONNRESET') {
    console.error('proxy error', error)
  }
  if (!res.headersSent) {
    res.writeHead(500, {'content-type': 'application/json'})
  }

  json = {error: 'proxy_error', reason: error.message}
  res.end(JSON.stringify(json))
})

app.use((req, res) => {
  const client = new ApiClient(req)
  const memoryHistory = createHistory(req.originalUrl)
  const store = createStore(memoryHistory, client)
  const history = syncHistoryWithStore(memoryHistory, store)

  function hydrateOnClient () {
    res.send('<!doctype html>\n' +
      ReactDOM.renderToString(<Html store={store} />))
  }

  match({ history, routes: getRoutes(store), location: req.originalUrl }, (error, redirectLocation, renderProps) => {
    if (redirectLocation) {
      res.redirect(redirectLocation.pathname + redirectLocation.search)
    } else if (error) {
      console.error('ROUTER ERROR:', error)
      res.status(500)
      hydrateOnClient()
    } else if (renderProps) {
      loadOnServer({...renderProps, store, helpers: {client}}).then(() => {
        const component = (
          <Provider store={store} key='provider'>
            <ReduxAsyncConnect {...renderProps} />
          </Provider>
        )
        global.navigator = {userAgent: req.headers['user-agent']}
        res.status(200).send('<!doctype html>\n' +
          ReactDOM.renderToString(<Html component={component} hash={bundleHash} store={store} />))
      })
    } else {
      res.status(404).send('Not found')
    }
  })
})

server.listen(config.port, (err) => {
  if (err) {
    console.error(err)
  }
  console.log(`Example app listening on port ${config.port}`)
})
