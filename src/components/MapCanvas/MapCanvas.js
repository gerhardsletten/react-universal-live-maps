import React, {Component, PropTypes} from 'react'
import {withGoogleMap, GoogleMap, Marker, Polyline} from 'react-google-maps'
import withScriptjs from 'react-google-maps/lib/async/withScriptjs'
import styled from 'styled-components'

import mapStyle from './mapstyle.json'
import {svgSymbol, pointToLngLat, arrayExplode} from '../../helpers/MapHelpers'

const icons = {
  first: '/icons/start.svg',
  last: '/icons/end.svg',
  sprint: '/icons/sprint.svg',
  com: '/icons/com.svg',
  com2: '/icons/com2.svg',
  com3: '/icons/com3.svg',
  food: '/icons/food.svg',
  lead: '/icons/lead.svg',
  group: '/icons/group.svg'
}

const Container = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`

const AsyncGoogleMap = withScriptjs(
  withGoogleMap(
    ({styles, onMapLoad, markers, course, first, last, activeMarkers}) => (
      <GoogleMap
        ref={onMapLoad}
        defaultZoom={4}
        defaultOptions={{
          styles
        }}
      >
        {course && <Polyline path={course.map((p) => pointToLngLat(p))} />}
        {first && <Marker position={pointToLngLat(first)} options={{icon: svgSymbol(icons['first'])}} />}
        {last && <Marker position={pointToLngLat(last)} options={{icon: svgSymbol(icons['last'])}} />}
        {markers && markers.map(({position, icon}, i) => {
          return <Marker key={i} position={pointToLngLat(position)} options={{icon: svgSymbol(icons[icon])}} />
        })}
        {activeMarkers && activeMarkers.map(({position, icon}, i) => {
          return <Marker key={i} position={pointToLngLat(position)} options={{icon: svgSymbol(icons[icon], {x: 0, y: 40}, {height: 40, width: 20})}} />
        })}
      </GoogleMap>
    )
  )
)

export default class MapCanvas extends Component {
  static propTypes = {
    course: PropTypes.array.isRequired,
    markers: PropTypes.array,
    activeMarkers: PropTypes.array
  }

  state = {}

  onMapLoad = (map) => {
    const {mapInited} = this.state
    if (!mapInited) {
      this.setState({mapInited: true}, () => {
        const {course} = this.props
        const bounds = new global.google.maps.LatLngBounds()
        course.forEach((p) => {
          const point = new global.google.maps.LatLng(pointToLngLat(p))
          bounds.extend(point)
        })
        map.fitBounds(bounds)
      })
    }
  }

  render () {
    const {course, markers, activeMarkers} = this.props
    const {first, last} = arrayExplode(course)
    return (
      <Container>
        <AsyncGoogleMap
          googleMapURL='https://maps.googleapis.com/maps/api/js?v=3.exp&key=AIzaSyDHscIq-b-BjHty_zsIonS7uPjZuiBY27U'
          loadingElement={
            <div style={{ height: `100%` }}>
              <div
                style={{
                  display: `block`,
                  width: `80px`,
                  height: `80px`,
                  margin: `150px auto`,
                  animation: `fa-spin 2s infinite linear`
                }}>
                loading
              </div>
            </div>
          }
          containerElement={
            <div style={{ height: `100%` }} />
          }
          mapElement={
            <div style={{ height: `100%` }} />
          }
          onMapLoad={this.onMapLoad}
          markers={markers}
          first={first}
          last={last}
          activeMarkers={activeMarkers}
          course={course}
          styles={mapStyle}
        />
      </Container>
    )
  }
}
