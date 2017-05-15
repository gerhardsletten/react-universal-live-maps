import React, {Component, PropTypes} from 'react'
import ReactDOM from 'react-dom/server'
import serialize from 'serialize-javascript'
import Helmet from 'react-helmet'
import styleSheet from 'styled-components/lib/models/StyleSheet'

styleSheet.flush()

export default class Html extends Component {
  static propTypes = {
    component: PropTypes.node,
    store: PropTypes.object,
    hash: PropTypes.string
  }

  render () {
    const {component, store, hash} = this.props
    const content = component ? ReactDOM.renderToString(component) : ''
    const head = Helmet.rewind()
    return (
      <html>
        <head>
          {head.base.toComponent()}
          {head.title.toComponent()}
          {head.meta.toComponent()}
          {head.link.toComponent()}
          {head.script.toComponent()}
          <meta name='viewport' content='width=device-width, initial-scale=1' />
          <link rel='shortcut icon' href='/favicon.ico' />
          <style>{styleSheet.rules().map(rule => rule.cssText).join('')}</style>
        </head>
        <body>
          <div id='content' dangerouslySetInnerHTML={{__html: content}} />
          <script dangerouslySetInnerHTML={{__html: `window.__data=${serialize(store.getState())}`}} charSet='UTF-8' />
          <script src={`/dist/bundle.js?v=${hash}`} charSet='UTF-8' />
        </body>
      </html>
    )
  }
}
