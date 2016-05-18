import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {asyncConnect} from 'redux-async-connect'
import {Link} from 'react-router'
import {isLoaded as isAuthLoaded, load as loadAuth, logout} from 'redux/modules/auth'
import {push} from 'react-router-redux'
import ga from 'react-ga'
import config from 'config'
import style from './style.css'

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

  componentDidMount() {
    ga.initialize(config.analytics, { debug: false });
    ga.pageview(this.props.location.pathname);
  }

  componentWillReceiveProps (nextProps) {
    if (!this.props.user && nextProps.user) {
      this.props.pushState('/admin')
    } else if (this.props.user && !nextProps.user) {
      this.props.pushState('/')
    }
    if (nextProps.location.pathname !== this.props.location.pathname) {
      ga.pageview(nextProps.location.pathname);
    }
  }

  render () {
    const {user} = this.props
    return (
      <div className={style.container}>
        {user && (
          <div className={style.userBar}><Link to='/'>Live</Link> <Link to='/maps'>Maps</Link> <Link to='/admin'>Admin</Link> Logged in as {user.username} <button onClick={this.handleLogout}>Logout</button></div>
        )}
        {this.props.children}
      </div>
    )
  }
}
