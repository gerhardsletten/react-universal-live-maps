const LOAD = 'livemaps/live/LOAD'
const LOAD_SUCCESS = 'livemaps/live/LOAD_SUCCESS'
const LOAD_FAIL = 'livemaps/live/LOAD_FAIL'
const UPDATE_LIVE = 'livemaps/live/UPDATE_LIVE'

const initialState = {
  loaded: false,
  item: {}
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
        item: action.result
      }
    case LOAD_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.error
      }
    case UPDATE_LIVE:
      return {
        ...state,
        item: {...state.item, live: action.result}
      }
    default:
      return state
  }
}

export function isLoaded (globalState, id = null) {
  return globalState.live && globalState.live.loaded
}

export function load () {
  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: (client) => client.get('/maps/live')
  }
}

export function updateLive (liveinfo) {
  return {
    type: UPDATE_LIVE,
    result: liveinfo
  }
}
