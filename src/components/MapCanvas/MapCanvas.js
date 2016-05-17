import React, {Component, PropTypes} from 'react'
import {GoogleMapLoader, GoogleMap, Polyline, Marker} from 'react-google-maps'
import style from './style.css'
import mapStyle from './mapstyle.json'
import {toGeoJSON, svgSymbol, pointToLngLat, arrayExplode} from 'helpers/MapHelpers'
import turf from 'turf'

const icons = {
  first: require('./icons/start.svg'),
  last: require('./icons/end.svg'),
  sprint: require('./icons/sprint.svg'),
  com: require('./icons/com.svg'),
  food: require('./icons/food.svg'),
  lead: require('./icons/lead.svg'),
  group: require('./icons/group.svg'),
}

export default class MapCanvas extends Component {
  static propTypes = {
    course: PropTypes.array.isRequired,
    markers: PropTypes.array,
    activeMarkers: PropTypes.array
  }

  state = {}

  onMapInit () {
    const {mapInited} = this.state
    if (!mapInited) {
      this.setState({mapInited: true}, () => {
        const {course} = this.props
        const bounds = new global.google.maps.LatLngBounds()
        course.forEach((p) => {
          const point = new global.google.maps.LatLng(pointToLngLat(p))
          bounds.extend(point)
        })
        this.refs.map.fitBounds(bounds)
      })
    }
  }

  render () {
    const {course, markers, activeMarkers} = this.props
    const {first, last} = arrayExplode(course)
    return (
      <div className={style.container}>
        <GoogleMapLoader
          containerElement={
            <div {...this.props} style={{height: '100%'}}/>
          }
          googleMapElement={
            <GoogleMap
              ref='map'
              onIdle={this.onMapInit.bind(this)}
              defaultZoom={4}
              defaultOptions={{
                styles: mapStyle
              }}>
              <Polyline
                path={course.map((p) => pointToLngLat(p))}
              />
              {first && this.renderMarker(first, 'first')}
              {last && this.renderMarker(last, 'last')}
              {markers && markers.map((marker, i) => {
                return this.renderMarker(marker.position, marker.icon, i)
              })}
              {activeMarkers && activeMarkers.map((marker, i) => {
                return this.renderActiveMarker(marker.position, marker.icon, i)
              })}
            </GoogleMap>
          }
        />
      </div>
    )
  }

  renderActiveMarker (position, icon = 'first', key) {
    return (
      <Marker key={key} position={pointToLngLat(position)} options={{icon: svgSymbol(icons[icon], {x: 0, y: 40}, {height: 40, width: 20})}} />
    )
  }

  renderMarker (position, icon = 'first', key) {
    return (
      <Marker key={key} position={pointToLngLat(position)} options={{icon: svgSymbol(icons[icon])}} />
    )
  }
}
