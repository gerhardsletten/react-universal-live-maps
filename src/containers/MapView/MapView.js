import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {asyncConnect} from 'redux-async-connect'
import Helmet from 'react-helmet'
import {isLoaded, loadOne} from 'redux/modules/maps'
import {GoogleMapLoader, GoogleMap, Polyline, Marker} from 'react-google-maps'
import style from './style.css'
import mapStyle from './mapstyle.json'
import turf from 'turf'

const icons = {
  start: require('./icons/start.svg'),
  end: require('./icons/end.svg'),
  sprint: require('./icons/sprint.svg'),
  com: require('./icons/com.svg'),
  food: require('./icons/food.svg')
}

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

  renderInfo (coordinates) {
    const {title} = this.props.map
    const course = this.toGeoJSON(coordinates, 'LineString')
    const distanceTotal = turf.lineDistance(course, 'kilometers')
    return (
      <div className={style.info}>{title}: {distanceTotal.toFixed(2)} km</div>
    )
  }

  renderMap (coordinates) {
    const {features} = this.props.map
    const start = coordinates[0]
    const end = coordinates[coordinates.length - 1]
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
              <Marker position={this.pointToLngLat(start)} options={{icon: this.svgSymbol('start')}} />
              {features && features.features.map((feature, i) => {
                if (feature.geometry.coordinates && feature.properties.icon) {
                  return (
                    <Marker key={i} position={this.pointToLngLat(feature.geometry.coordinates)} options={{icon: this.svgSymbol(feature.properties.icon)}} />
                  )
                }
              })}
              <Marker position={this.pointToLngLat(end)} options={{icon: this.svgSymbol('end')}} />
            </GoogleMap>
          }
        />
        {this.state.mapInited && this.renderInfo(coordinates)}
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

  svgSymbol (type = 'start') {
    return {
      url: icons[type],
      anchor: {x: 16, y: 16},
      scaledSize: {height: 32, width: 32}
    }
  }

  pointToLngLat (p) {
    return {
      lng: p[0],
      lat: p[1]
    }
  }
}
