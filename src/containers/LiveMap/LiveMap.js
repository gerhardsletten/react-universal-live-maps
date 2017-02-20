import React, {Component} from 'react'
import {connect} from 'react-redux'
import {asyncConnect} from 'redux-connect'
import Helmet from 'react-helmet'
import PointOnLine from '@turf/point-on-line'
import LineSlice from '@turf/line-slice'
import LineDistance from '@turf/line-distance'
import moment from 'moment'
import styled from 'styled-components'

import {isLoaded, load, updateLive} from '../../redux/modules/live'
import {toGeoJSON} from '../../helpers/MapHelpers'
import {MapCanvas} from '../../components'

const Container = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`
const Map = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 40px;
`
const Bar = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0px;
  line-height: 40px;
  font-size: 11px;
  white-space: nowrap;
  text-overlfow: ellipsis;
  overflow: hidden;
`
const Title = styled.strong`
  color: #FFD634;
  display: inline-block;
  @media screen and (max-width: 600px) {
    display: none;
  }
`
const Live = styled.strong`
  background: #FFD634;
  float:left;
  line-height: 40px; 
  padding: 0 15px;
  margin-right: 15px;
  color: #000;
`

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
  }),
  {updateLive}
)
export default class LiveMap extends Component {

  state = {}

  socketListener = (liveupdate) => {
    if (console && console.log) {
      console.log('ws update', liveupdate)
    }
    this.props.updateLive({
      lead: liveupdate.lead,
      group: liveupdate.group
    })
  }

  render () {
    const {error} = this.props
    if (error) {
      return (
        <Container>
          <Helmet title={error} />
          <div>
            <h1>{error}</h1>
          </div>
        </Container>
      )
    }
    const {title, course, date, features, live: {lead, group}} = this.props.map
    const activeMarkers = []
    let leadElapsed, groupElapsed
    let message
    if (moment().isBefore(date)) {
      message = `Starts sending ${moment(date).format('ddd DD. MMM HH:mm:ss')}`
    } else {
      if (lead) {
        activeMarkers.push({
          position: lead,
          icon: 'lead'
        })
        leadElapsed = this.getElapsed(course.coordinates, lead)
        if (leadElapsed > 0) {
          message = `Lead: ${this.formatDistance(leadElapsed)}`
        }
      }
      if (group) {
        activeMarkers.push({
          position: group,
          icon: 'group'
        })
        groupElapsed = this.getElapsed(course.coordinates, group)
        if (leadElapsed > 0 && groupElapsed > 0) {
          message += `, Group: ${this.formatDistance(Math.abs(leadElapsed - groupElapsed))} behind`
        }
      }
      if (leadElapsed <= 0 || groupElapsed <= 0) {
        message = 'GPS units not within track'
      }
    }
    return (
      <Container>
        <Helmet title={title} />
        {course.coordinates && (
          <Map>
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
          </Map>
        )}
        <Bar>
          <Live>LIVE</Live>
          <Title>{title}</Title>{' '}
          {message}
        </Bar>
      </Container>
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
    const snapped = PointOnLine(course, point)
    const sliced = LineSlice(toGeoJSON(coordinates[0]), snapped, course)
    return LineDistance(sliced, 'kilometers')
  }

}
