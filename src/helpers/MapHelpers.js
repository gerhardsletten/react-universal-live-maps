export function toGeoJSON (coordinates, type = 'Point') {
  return {
    type: 'Feature',
    geometry: {
      type: type,
      coordinates: coordinates
    }
  }
}

export function pinSymbol (color = '#999999') {
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

export function svgSymbol (url, anchor = {x: 16, y: 16}, size = {height: 24, width: 24}) {
  return {
    url: url,
    anchor: anchor,
    scaledSize: size
  }
}

export function pointToLngLat (p) {
  return {
    lng: p[0],
    lat: p[1]
  }
}

export function arrayExplode (arr = []) {
  return {
    first: arr.length > 0 ? arr[0] : null,
    last: arr.length > 0 ? arr[arr.length - 1] : null
  }
}
