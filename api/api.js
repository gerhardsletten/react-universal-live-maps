import express from 'express'
import session from 'express-session'
import bodyParser from 'body-parser'
import config from '../src/config'
import http from 'http'
import SocketIo from 'socket.io'
import mongoose from 'mongoose'
import {
  User,
  Maps
} from './routes'

mongoose.connect(config.databaseUri)

const app = express()
const server = new http.Server(app)
const MongoStore = require('connect-mongo')(session)

const io = new SocketIo(server)
const connections = []
io.path('/ws')

app.use(session({
  secret: config.sessionSecret,
  resave: false,
  store: new MongoStore({mongooseConnection: mongoose.connection}),
  saveUninitialized: false,
  cookie: { maxAge: (3600000 * 24 * config.sessionTimeoutDays) }
}))
app.use(bodyParser.json())

var router = express.Router()

/* User routes */
router.route('/user/login').post(User.login)
router.route('/user/logout').post(User.logout)
router.route('/user/load').get(User.loadAuth)

/* Message routes */
router.route('/maps').get(Maps.readAll)
router.route('/maps/:id').get(Maps.readOne)
router.route('/maps/:id').put(User.requireAuth, Maps.edit)
router.route('/maps').post(User.requireAuth, Maps.create)
router.route('/maps/:id').delete(User.requireAuth, Maps.remove)

app.use(router)

if (config.apiPort) {
  const runnable = app.listen(config.apiPort, (err) => {
    if (err) {
      console.error(err)
    }
    console.info('----\n==> 🌎  API is running on port %s', config.apiPort)
    console.info('==> 💻  Send requests to http://%s:%s', config.apiHost, config.apiPort)
  })

  io.on('connection', (socket) => {
    connections.push(socket)
    socket.on('disconnect', () => {
      const index = connections.indexOf(socket)
      connections.splice(index, 1)
    })
  })
  io.listen(runnable)
} else {
  console.error('==> ERROR: No PORT environment variable has been specified')
}
