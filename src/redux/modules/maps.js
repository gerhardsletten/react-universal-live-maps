const LOAD = 'livemaps/maps/LOAD'
const LOAD_SUCCESS = 'livemaps/maps/LOAD_SUCCESS'
const LOAD_FAIL = 'livemaps/maps/LOAD_FAIL'
const LOADONE = 'livemaps/maps/LOADONE'
const LOADONE_SUCCESS = 'livemaps/maps/LOADONE_SUCCESS'
const LOADONE_FAIL = 'livemaps/maps/LOADONE_FAIL'
const ADD = 'livemaps/maps/ADD'
const ADD_SUCCESS = 'livemaps/maps/ADD_SUCCESS'
const ADD_FAIL = 'livemaps/maps/ADD_FAIL'
const EDIT = 'livemaps/maps/EDIT'
const EDIT_SUCCESS = 'livemaps/maps/EDIT_SUCCESS'
const EDIT_FAIL = 'livemaps/maps/EDIT_FAIL'
const REMOVE = 'livemaps/maps/REMOVE'
const REMOVE_SUCCESS = 'livemaps/maps/REMOVE_SUCCESS'
const REMOVE_FAIL = 'livemaps/maps/REMOVE_FAIL'

const initialState = {
  loaded: false,
  items: []
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
        items: action.result.map((item) => {
          const found = state.items.find((prevItem) => prevItem._id === item._id)
          if (found) {
            return found
          }
          return item
        })
      }
    case LOAD_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.error
      }
    case LOADONE:
      return {
        ...state,
        loading: true
      }
    case LOADONE_SUCCESS:
      if (state.items.find((item) => item._id === action.result._id)) {
        return {
          ...state,
          loading: false,
          items: state.items.map((item) => {
            if (item._id === action.result._id) {
              return action.result
            }
            return item
          })
        }
      } else {
        return {
          ...state,
          loading: false,
          items: [...state.items, action.result]
        }
      }
    case LOADONE_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.error
      }
    case ADD:
    case EDIT:
      return {
        ...state,
        loading: true
      }
    case ADD_SUCCESS:
      return {
        ...state,
        loading: false,
        items: [
          ...state.items,
          action.result
        ]
      }
    case EDIT_SUCCESS:
      return {
        ...state,
        loading: false,
        items: state.items.map((item) => {
          if (item._id === action.result._id) {
            return action.result
          }
          return item
        })
      }
    case ADD_FAIL:
    case EDIT_FAIL:
      return {
        ...state,
        loading: false,
        error: action.error
      }
    case REMOVE:
      return {
        ...state,
        loading: true
      }
    /* We do not insert here, but let socket pipe the added item back to us */
    case REMOVE_SUCCESS:
      return {
        ...state,
        loading: false,
        items: state.items.filter((item) => item._id !== action.result._id)
      }
    case REMOVE_FAIL:
      return {
        ...state,
        loading: false,
        error: action.error
      }
    default:
      return state
  }
}

export function isLoaded (globalState, id = null) {
  if (id) {
    return globalState.maps.items.find((item) => item._id === id) && globalState.maps.items.filter((item) => item._id === id).course
  } else {
    return globalState.maps && globalState.maps.loaded
  }
}

export function load () {
  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: (client) => client.get('/maps')
  }
}

export function loadOne (id) {
  return {
    types: [LOADONE, LOADONE_SUCCESS, LOADONE_FAIL],
    promise: (client) => client.get(`/maps/${id}`)
  }
}

export function add (item) {
  return {
    types: [ADD, ADD_SUCCESS, ADD_FAIL],
    promise: (client) => client.post('/maps', {
      data: item
    })
  }
}
export function edit (id, item) {
  return {
    types: [EDIT, EDIT_SUCCESS, EDIT_FAIL],
    promise: (client) => client.put(`/maps/${id}`, {
      data: item
    })
  }
}
export function remove (id) {
  return {
    types: [REMOVE, REMOVE_SUCCESS, REMOVE_FAIL],
    promise: (client) => client.del(`/maps/${id}`)
  }
}
