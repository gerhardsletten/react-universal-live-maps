import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {asyncConnect} from 'redux-async-connect'
import Helmet from 'react-helmet'
import {isLoaded, loadOne} from 'redux/modules/maps'
import {GoogleMapLoader, GoogleMap, Polyline, Marker} from 'react-google-maps'
import style from './style.css'
import mapStyle from './mapstyle.json'
import icon from './icons/icon.svg'
import turf from 'turf'

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
    error: state.maps.error,
    loading: state.maps.loading
  })
)
export default class MapView extends Component {
  color = {
    start: '#C1272D',
    end: '#00AEEF'
  }

  state = {}

  onMapInit () {
    const {mapInited} = this.state
    if (!mapInited) {
      this.setState({mapInited: true}, () => {
        const {course: {coordinates}} = this.props.map
        const bounds = new global.google.maps.LatLngBounds()
        coordinates.forEach((p) => {
          const point = new global.google.maps.LatLng(this.pointToLngLat(p))
          bounds.extend(point)
        })
        this.refs.map.fitBounds(bounds)
      })
    }
  }

  render () {
    const {title, course} = this.props.map
    return (
      <div>
        <Helmet title={title} />
        <div className={style.container}>
          {course && this.renderMap(course.coordinates)}
        </div>
      </div>
    )
  }

  renderInfo (coordinates, point) {
    const {title} = this.props.map
    const course = this.toGeoJSON(coordinates, 'LineString')
    const athlete = this.toGeoJSON(point)
    const snapped = turf.pointOnLine(course, athlete)
    const sliced = turf.lineSlice(this.toGeoJSON(coordinates[0]), snapped, course)
    const distanceCurrent = turf.lineDistance(sliced, 'kilometers')
    const distanceTotal = turf.lineDistance(course, 'kilometers')
    return (
      <div className={style.info}>{title}: {distanceTotal.toFixed(2)} km / {distanceCurrent.toFixed(2)} km</div>
    )
  }

  renderMap (coordinates) {
    const start = coordinates[0]
    const end = coordinates[coordinates.length - 1]
    const marker = coordinates[Math.floor(coordinates.length / 2)]
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
                path={coordinates.map((p) => this.pointToLngLat(p))}
              />
              <Marker position={this.pointToLngLat(start)} options={{icon: this.pinSymbol(this.color.start)}} />
              <Marker position={this.pointToLngLat(end)} options={{icon: this.pinSymbol(this.color.end)}} />
              <Marker position={this.pointToLngLat(marker)} options={{icon: this.svgSymbol()}} />
            </GoogleMap>
          }
        />
        {this.state.mapInited && this.renderInfo(coordinates, marker)}
      </div>
    )
  }

  /* Move to utility */

  toGeoJSON (coordinates, type = 'Point') {
    return {
      type: 'Feature',
      geometry: {
        type: type,
        coordinates: coordinates
      }
    }
  }

  pinSymbol (color = '#999999') {
    return {
      path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z',
      fillColor: color,
      fillOpacity: 1,
      strokeColor: '#000',
      strokeWeight: 1,
      strokeOpacity: 0.5,
      scale: 1
    }
  }

  svgSymbol () {
    return {
      url: icon,
      anchor: {x: 12, y: 12},
      scaledSize: {height: 24, width: 24}
    }
  }

  pointToLngLat (p) {
    return {
      lng: p[0],
      lat: p[1]
    }
  }
}
