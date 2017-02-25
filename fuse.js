const fsbx = require('fuse-box')
const fs = require('fs')
const babelrc = fs.readFileSync('./.babelrc')
const isDevelopment = !(process.env.NODE_ENV && process.env.NODE_ENV === 'production')

const prodPlugins = isDevelopment ? [] : [fsbx.UglifyJSPlugin({
  fromString: true,
  warnings: true,
  parse: {
    strict: true
  },
  compress: false
})]

const fuseBox = fsbx.FuseBox.init({
  homeDir: 'src/',
  sourceMap: {
    bundleReference: './sourcemaps.js.map',
    outFile: './static/dist/sourcemaps.js.map'
  },
  outFile: './static/dist/bundle.js',
  shim: {
    'xmlhttprequest-ssl': {
      source: 'src/shim/xmlhttprequest.js',
      exports: 'global.XMLHttpRequestSSL'
    }
  },
  plugins: [
    fsbx.BabelPlugin({
      config: Object.assign({}, {sourceMaps: true}, JSON.parse(babelrc))
    }),
    fsbx.EnvPlugin({
      __CLIENT__: true,
      __SERVER__: false,
      __DEVELOPMENT__: isDevelopment,
      NODE_ENV: process.env.NODE_ENV
    }),
    fsbx.JSONPlugin()
  ].concat(prodPlugins)
})
if (isDevelopment) {
  fuseBox.devServer('>client.js', {
    httpServer: false,
    root: 'static/dist'
  })
} else {
  fuseBox.bundle('>client.js')
}
