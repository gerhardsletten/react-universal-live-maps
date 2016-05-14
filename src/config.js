require('babel-polyfill')

const environment = {
  development: {
    isProduction: false
  },
  production: {
    isProduction: true
  }
}[process.env.NODE_ENV || 'development']

module.exports = Object.assign({
  host: process.env.HOST || 'localhost',
  port: process.env.PORT,
  apiHost: process.env.APIHOST || 'localhost',
  apiPort: process.env.APIPORT,
  databaseUri: process.env.DATABASE_URI || 'mongodb://localhost:27017/livemaps',
  sessionSecret: process.env.SESSION_SECRET || 'supersecret',
  sessionTimeoutDays: process.env.SESSION_TIMEOUT || 7,
  tokenSecret: process.env.TOKEN_SECRET || 'supersecret',
  username: process.env.USERNAME || 'admin',
  password: process.env.PASSWORD || 'secret',
  app: {
    title: 'Livemaps',
    description: 'En beskrivelse',
    head: {
      titleTemplate: 'Livemaps: %s',
      meta: [
        {name: 'description', content: 'Dine oppgaver..'},
        {charset: 'utf-8'},
        {property: 'og:site_name', content: 'Livemaps'},
        {property: 'og:image', content: ''},
        {property: 'og:locale', content: 'nb_NO'},
        {property: 'og:title', content: 'Livemaps'},
        {property: 'og:description', content: 'Dine oppgaver..'},
        {property: 'og:card', content: 'summary'},
        {property: 'og:site', content: '@interspons'},
        {property: 'og:creator', content: '@interspons'},
        {property: 'og:image:width', content: '200'},
        {property: 'og:image:height', content: '200'}
      ]
    }
  }
}, environment)
