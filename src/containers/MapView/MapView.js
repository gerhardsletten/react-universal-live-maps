import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {asyncConnect} from 'redux-async-connect'
import Helmet from 'react-helmet'
import {isLoaded, loadOne} from 'redux/modules/maps'
import {MapCanvas} from 'components'
import style from './style.css'


@asyncConnect([{
  promise: ({
    store: {dispatch, getState},
    params: {id}
  }) => {
    const promises = []
    if (!isLoaded(getState(), id)) {
      promises.push(dispatch(loadOne(id)))
    }
    return Promise.all(promises)
  }
}])
@connect(
  (state, ownProps) => ({
    map: state.maps.items.find((item) => item._id === ownProps.params.id),
    error: state.maps.error
  })
)
export default class MapView extends Component {
  render () {
    const {title, course, features} = this.props.map
    return (
      <div className={style.container}>
        <Helmet title={title} />
        {course.coordinates && (
          <MapCanvas 
            course={course.coordinates}
            markers={features.features ? features.features.map((feature) => {
              return {
                position: feature.geometry.coordinates,
                icon: feature.properties.icon
              }
            }) : []}
          />
        )}
      </div>
    )
  }
}
