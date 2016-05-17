import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {asyncConnect} from 'redux-async-connect'
import Helmet from 'react-helmet'
import turf from 'turf'
import {isLoaded, load} from 'redux/modules/live'
import {toGeoJSON, svgSymbol, pointToLngLat, arrayExplode} from 'helpers/MapHelpers'
import {MapCanvas} from 'components'
import style from './style.css'

@asyncConnect([{
  promise: ({store: {dispatch, getState}}) => {
    const promises = []
    if (!isLoaded(getState())) {
      promises.push(dispatch(load()))
    }
    return Promise.all(promises)
  }
}])
@connect(
  (state, ownProps) => ({
    map: state.live.item,
    error: state.live.error
  })
)
export default class LiveMap extends Component {

  state = {}

  componentDidMount () {
    const {course} = this.props.map
    if (course.coordinates) {
      this.setState({
        lead: course.coordinates[Math.floor(course.coordinates.length / 2)],
        group: course.coordinates[Math.floor(course.coordinates.length / 3)]
      })
    }
    if (__CLIENT__) {
      console.log('Socket')
    }

  }

  socketListener = (message) => {
    console.log('socketListener', message)
  }

  componentWillUnmount () {
    if (this.client) {
      
    }
  }

  render () {
    const {title, course, features} = this.props.map
    const {lead, group} = this.state
    const activeMarkers = []
    let leadElapsed, groupElapsed
    if (lead) {
      activeMarkers.push({
        position: lead,
        icon: 'lead'
      })
      leadElapsed = this.getElapsed(course.coordinates, lead)
    }
    if (group) {
      activeMarkers.push({
        position: group,
        icon: 'group'
      })
      groupElapsed = this.getElapsed(course.coordinates, group)
    }
    return (
      <div className={style.container}>
        <Helmet title={title} />
        {course.coordinates && (
          <div className={style.map}>
            <MapCanvas 
              course={course.coordinates}
              markers={features.features ? features.features.map((feature) => {
                return {
                  position: feature.geometry.coordinates,
                  icon: feature.properties.icon
                }
              }) : []}
              activeMarkers={activeMarkers}
            />
          </div>
        )}
        <div className={style.bar}>
          <strong className={style.live}>LIVE</strong>
          <strong className={style.title}>{title}</strong>{' '}
          {leadElapsed && (
            <span>Lead: {this.formatDistance(leadElapsed)}{' '}</span>
          )}
          {group && (
            <span>Group: {this.formatDistance(Math.abs(leadElapsed - groupElapsed))} behind{' '}</span>
          )}
        </div>
      </div>
    )
  }

  formatDistance (dist) {
    if (dist > 1) {
      return `${dist.toFixed(2)} km`
    }
    return `${(dist * 1000).toFixed(2)} m`
  }

  getElapsed (coordinates, position) {
    const course = toGeoJSON(coordinates, 'LineString')
    const point = toGeoJSON(position)
    const snapped = turf.pointOnLine(course, point)
    const sliced = turf.lineSlice(toGeoJSON(coordinates[0]), snapped, course)
    return turf.lineDistance(sliced, 'kilometers')
  }

}
