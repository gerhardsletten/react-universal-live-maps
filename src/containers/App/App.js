import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {asyncConnect} from 'redux-connect'
import {Link} from 'react-router'
import {push} from 'react-router-redux'
import ga from 'react-ga'
import styled, {injectGlobal} from 'styled-components'

import {isLoaded as isAuthLoaded, load as loadAuth, logout} from '../../redux/modules/auth'
import config from '../../config'

injectGlobal`
  * {
    margin: 0;
    padding: 0;
  }
  html,
  body {
    height: 100%;
    padding: 0;
    margin: 0;
    background: #333;
    font-family: sans-serif;
    color: #fff;
  }
  a {
    color: #fff;
  }
  body > div {
    height: 100%;
  }
  p {
    margin-bottom: 10px;
  }
`

const Container = styled.div`
  height: 100%;
`

const UserBar = styled.div`
  z-index: 100;
  position: absolute;
  top: 0;
  right: 0;
  padding: 5px 10px;
  color: #fff;
  background: #333;
  font-size: 12px;
`
const MenuItem = styled.span`
  display: inline-block;
  padding: 2px 4px;
`

@asyncConnect([{
  promise: ({store: {dispatch, getState}}) => {
    const promises = []
    if (!isAuthLoaded(getState())) {
      promises.push(dispatch(loadAuth()))
    }
    return Promise.all(promises)
  }
}])
@connect(
  (state) => ({
    user: state.auth.user
  }),
  {
    pushState: push,
    logout
  }
)
export default class App extends Component {
  static propTypes = {
    children: PropTypes.object.isRequired,
    user: PropTypes.object,
    pushState: PropTypes.func.isRequired
  }

  static contextTypes = {
    store: PropTypes.object.isRequired
  }

  handleLogout = (event) => {
    event.preventDefault()
    this.props.logout()
  }

  componentDidMount () {
    ga.initialize(config.analytics, { debug: false })
    ga.pageview(this.props.location.pathname)
  }

  componentWillReceiveProps (nextProps) {
    if (!this.props.user && nextProps.user) {
      this.props.pushState('/admin')
    } else if (this.props.user && !nextProps.user) {
      this.props.pushState('/')
    }
    if (nextProps.location.pathname !== this.props.location.pathname) {
      ga.pageview(nextProps.location.pathname)
    }
  }

  render () {
    const {user} = this.props
    return (
      <Container>
        {user && (
          <UserBar>
            <MenuItem><Link to='/'>Live</Link></MenuItem>
            <MenuItem><Link to='/maps'>Maps</Link></MenuItem>
            <MenuItem><Link to='/admin'>Admin</Link></MenuItem>
            <MenuItem>Logged in as {user.username}</MenuItem>
            <MenuItem><button onClick={this.handleLogout}>Logout</button></MenuItem>
          </UserBar>
        )}
        {this.props.children}
      </Container>
    )
  }
}
