import React from 'react'
import {Route, IndexRoute} from 'react-router'
import {isLoaded as isAuthLoaded, load as loadAuth} from 'redux/modules/auth'
import {
    App,
    MapList,
    MapView,
    Login,
    NotFound,
    Admin
} from 'containers'

export default (store) => {
  const requireLogin = (nextState, replace, cb) => {
    function checkAuth () {
      const {auth: { user }} = store.getState()
      if (!user) {
        replace('/login')
      }
      cb()
    }

    if (!isAuthLoaded(store.getState())) {
      store.dispatch(loadAuth()).then(checkAuth)
    } else {
      checkAuth()
    }
  }

  return (
    <Route path='/' component={App}>
      <IndexRoute component={MapList}/>
      <Route path='/maps' component={MapList}/>
      <Route path='/maps/:id' component={MapView}/>
      <Route onEnter={requireLogin}>
        <Route path='/admin' component={Admin}/>
      </Route>
      <Route path='login' component={Login}/>
      <Route path='*' component={NotFound} status={404}/>
    </Route>
  )
}
