const LOAD = 'livemaps/messages/LOAD'
const LOAD_SUCCESS = 'livemaps/messages/LOAD_SUCCESS'
const LOAD_FAIL = 'livemaps/messages/LOAD_FAIL'
const LOADONE = 'livemaps/messages/LOADONE'
const LOADONE_SUCCESS = 'livemaps/messages/LOADONE_SUCCESS'
const LOADONE_FAIL = 'livemaps/messages/LOADONE_FAIL'
const ADD = 'livemaps/messages/ADD'
const ADD_SUCCESS = 'livemaps/messages/ADD_SUCCESS'
const ADD_FAIL = 'livemaps/messages/ADD_FAIL'
const EDIT = 'livemaps/messages/EDIT'
const EDIT_SUCCESS = 'livemaps/messages/EDIT_SUCCESS'
const EDIT_FAIL = 'livemaps/messages/EDIT_FAIL'
const REMOVE = 'livemaps/messages/REMOVE'
const REMOVE_SUCCESS = 'livemaps/messages/REMOVE_SUCCESS'
const REMOVE_FAIL = 'livemaps/messages/REMOVE_FAIL'

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
        items: action.result
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
