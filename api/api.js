import express from 'express'
import session from 'express-session'
import bodyParser from 'body-parser'
import config from '../src/config'
import mongoose from 'mongoose'
import http from 'http'
import SocketIo from 'socket.io'
import Agenda from 'agenda'
import Settings from './models/Settings'
import {
  User,
  Maps
} from './routes'

mongoose.connect(config.databaseUri)
const agenda = new Agenda({db: {address: config.databaseUri}})

const app = express()
const MongoStore = require('connect-mongo')(session)

const server = new http.Server(app)
const io = new SocketIo(server)
io.path('/ws')
const sessionDBKey = 'socket-connections'

Settings.findOne({key: sessionDBKey}).then((doc) => {
  if (!doc) {
    const doc = new Settings({key: sessionDBKey, numberValue: 0})
    doc.save((nada) => {
      console.log('created db')
    })
  } else {
    doc.numberValue = 0
    doc.save()
  }
})

agenda.define('broadcast', function(job, done) {
  Maps.findLiveEvents().then((docs) => {
    if (docs.length > 0) {
      Maps.fetchLivePosition().then((data) => {
        Settings.findOne({key: sessionDBKey}).then((doc) => {
          io.sockets.emit('update', {listners: doc.numberValue, ...data})
        })
      })
    }
  })
  done()
})

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
router.route('/maps/live').get(Maps.live)
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
    Settings.findOne({key: sessionDBKey}).then((doc) => {
      doc.numberValue = doc.numberValue + 1
      doc.save()
    })
    socket.on('disconnect', () => {
      Settings.findOne({key: sessionDBKey}).then((doc) => {
        doc.numberValue = doc.numberValue - 1
        doc.save()
      })
    })
  })
  io.listen(runnable)
  agenda.on('ready', () => {
    agenda.every(config.live.interval, 'broadcast')
    agenda.start()
    console.log('agenda start')
    function graceful() {
      agenda.stop(function() {
        process.exit(0)
      })
    }
    process.on('SIGTERM', graceful)
    process.on('SIGINT' , graceful)
  })
} else {
  console.error('==> ERROR: No PORT environment variable has been specified')
}
