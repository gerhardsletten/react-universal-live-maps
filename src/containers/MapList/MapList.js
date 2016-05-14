import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {asyncConnect} from 'redux-async-connect'
import {Link} from 'react-router'
import Helmet from 'react-helmet'
import {isLoaded, load as loadMaps} from 'redux/modules/maps'
import style from './style.css'

@asyncConnect([{
  promise: ({store: {dispatch, getState}}) => {
    const promises = []
    if (!isLoaded(getState())) {
      promises.push(dispatch(loadMaps()))
    }
    return Promise.all(promises)
  }
}])
@connect(
  (state) => ({
    maps: state.maps.items,
    error: state.maps.error,
    loading: state.maps.loading
  })
)
export default class MapList extends Component {
  static propTypes = {
    maps: PropTypes.array
  }

  render () {
    const {maps} = this.props
    return (
      <div className={style.container}>
        <Helmet title='Maps'/>
        <h1>Maps</h1>
        <ul>
          {maps.map((item, i) => {
            return (
              <li key={i}>
                <Link to={`/maps/${item._id}`}>{item.title}</Link>
              </li>
            )
          })}
        </ul>
      </div>
    )
  }
}
