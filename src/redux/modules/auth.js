const LOAD = 'livemaps/auth/LOAD'
const LOAD_SUCCESS = 'livemaps/auth/LOAD_SUCCESS'
const LOAD_FAIL = 'livemaps/auth/LOAD_FAIL'
const LOGIN = 'livemaps/auth/LOGIN'
const LOGIN_SUCCESS = 'livemaps/auth/LOGIN_SUCCESS'
const LOGIN_FAIL = 'livemaps/auth/LOGIN_FAIL'
const LOGOUT = 'livemaps/auth/LOGOUT'
const LOGOUT_SUCCESS = 'livemaps/auth/LOGOUT_SUCCESS'
const LOGOUT_FAIL = 'livemaps/auth/LOGOUT_FAIL'

const initialState = {
  loaded: false
}

export default function reducer (state = initialState, action = {}) {
  switch (action.type) {
    case LOAD:
      return {
        ...state,
        loading: true
      }
    case LOAD_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        user: action.result
      }
    case LOAD_FAIL:
      return {
        ...state,
        loading: false,
        loaded: true,
        error: action.error
      }
    case LOGIN:
      return {
        ...state,
        loggingIn: true
      }
    case LOGIN_SUCCESS:
      return {
        ...state,
        loggingIn: false,
        user: action.result
      }
    case LOGIN_FAIL:
      return {
        ...state,
        loggingIn: false,
        user: null,
        loginError: action.error
      }
    case LOGOUT:
      return {
        ...state,
        loggingOut: true
      }
    case LOGOUT_SUCCESS:
      return {
        ...state,
        loggingOut: false,
        user: null
      }
    case LOGOUT_FAIL:
      return {
        ...state,
        loggingOut: false,
        logoutError: action.error
      }
    default:
      return state
  }
}

export function isLoaded (globalState) {
  return globalState.auth && globalState.auth.loaded
}

export function isAuthenticated (globalState) {
  return globalState.auth && globalState.auth.user
}

export function load () {
  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: (client) => client.get('/user/load')
  }
}

export function login (username, password) {
  return {
    types: [LOGIN, LOGIN_SUCCESS, LOGIN_FAIL],
    promise: (client) => client.post('/user/login', {
      data: {
        username: username,
        password: password
      }
    })
  }
}

export function logout () {
  return {
    types: [LOGOUT, LOGOUT_SUCCESS, LOGOUT_FAIL],
    promise: (client) => client.post('/user/logout')
  }
}
