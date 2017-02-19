import togeojson from '@mapbox/togeojson'
import {jsdom} from 'jsdom'
import http from 'http'
import concat from 'concat-stream'
import Map from '../models/Map'
import moment from 'moment-timezone'
import config from '../../src/config'
const parser = require('xml2json')

const CACHE_KEY = 'liveCache'
var cache = require('lazycache')(1000 * 30)

function readAll (req, res) {
  Map
  .find({})
  .select('title url date date_end features')
  .sort('date')
  .exec()
  .then((maps) => res.json(maps))
}

function findLiveEvents () {
  return new Promise((resolve, reject) => {
    Map
    .find({
      date: {
        $lte: moment().tz("Europe/Oslo").utc().toDate()
      },
      date_end: {
        $gte: moment().tz("Europe/Oslo").utc().toDate()
      }
    })
    .sort('date')
    .limit(1)
    .then((doc) => {
      resolve(doc)
    })
  })
}

function live (req, res) {
  Promise.all([
    Map
    .findOne({
      date_end: {
        $gte: moment().tz('Europe/Oslo').utc().toDate()
      }
    })
    .sort('date')
    .lean(),
    fetchLivePosition(true)
  ]).then(([map, live]) => {
    if (map) {
      return res.json({...map, live})
    }
    res.status(404).json('No upcoming live-event')
  })
  .catch((err) => {
    res.status(403).json(err)
  })
}

function readOne (req, res) {
  Map
  .findOne({_id: req.params.id})
  .then((doc) => {
    res.json(doc)
  })
  .catch((err) => {
    res.status(403).json(err)
  })
}

function fetchLivePosition (cached = false) {
  if (cached && cache.get(CACHE_KEY)) {
    return Promise.resolve(cache.get(CACHE_KEY))
  }
  return new Promise((resolve, reject) => {
    http.get(config.live.url, (resp) => {
      resp.on('error', (err) => reject(err))
      resp.pipe(concat((buffer) => {
        const raw = JSON.parse(parser.toJson(buffer.toString()))
        if (raw.GPS && raw.GPS.Unit && raw.GPS.Unit.length > 1) {
          const leadData = raw.GPS.Unit.find((item) => item.gpsID === config.live.lead)
          const groupData = raw.GPS.Unit.find((item) => item.gpsID === config.live.group)
          const obj = {}
          if (leadData) {
            obj.lead = [parseFloat(leadData.X), parseFloat(leadData.Y)]
          }
          if (groupData) {
            obj.group = [parseFloat(groupData.X), parseFloat(groupData.Y)]
          }
          cache.set(CACHE_KEY, obj)
          return resolve(obj)
        }
        return resolve()
      }))
    })
  })
}

function handleUpload (url) {
  if (!url) {
    return Promise.resolve()
  }
  return new Promise((resolve, reject) => {
    http.get(url, (resp) => {
      resp.on('error', (err) => reject(err))
      resp.pipe(concat((buffer) => {
        const kml = jsdom(buffer.toString())
        const converted = togeojson.kml(kml)
        resolve(converted.features[0].geometry)
      }))
    })
  })
}

function handleFields (fields, required = ['title'], upload = false) {
  return new Promise((resolve, reject) => {
    Promise.all([
      (upload) ? handleUpload(fields.url) : Promise.resolve()
    ]).then((promises) => {
      let doc = {...fields}
      if (upload && fields.url) {
        doc = Object.assign({}, fields, {
          course: promises[0]
        })
      }
      if (doc.date) {
        doc.date = moment(doc.date, moment.ISO_8601).toDate()
      }
      if (doc.date_end) {
        doc.date_end = moment(doc.date_end, moment.ISO_8601).toDate()
      }
      if (doc.features) {
        doc.features = JSON.parse(doc.features)
      }
      const errors = []
      required.map((field) => {
        if (!doc[field] || doc[field] === '') {
          errors.push(field)
        }
      })
      if (errors.length > 0) {
        return reject(`${errors.join(', ')} is required!`)
      }
      delete doc._id
      resolve(doc)
    })
    .catch(reject)
  })
}

function create (req, res) {
  handleFields(req.body, ['title', 'url'], true)
  .then((fields) => {
    const doc = new Map(fields)
    doc.save((nada) => {
      res.json(doc)
    })
  })
  .catch((err) => {
    res.status(403).json(err)
  })
}

function edit (req, res) {
  Map.findOne({_id: req.params.id})
  .then((doc) => {
    return handleFields(req.body, ['title'], doc.url !== req.body.url)
    .then((fields) => {
      for (let key in fields) {
        if (fields.hasOwnProperty(key)) {
          doc[key] = fields[key]
        }
      }
      return doc.save()
    })
  })
  .then((doc) => {
    res.json(doc)
  })
  .catch((err) => {
    res.status(403).json(err)
  })
}

function remove (req, res) {
  Map.findOne({_id: req.params.id})
  .then((doc) => {
    return doc.remove()
  })
  .then((doc) => {
    res.json(doc)
  })
  .catch((err) => res.status(403).json(err))
}

const Maps = {
  readAll,
  live,
  readOne,
  edit,
  create,
  remove,
  findLiveEvents,
  fetchLivePosition
}

export default Maps
