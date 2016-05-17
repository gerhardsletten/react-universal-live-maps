import togeojson from 'togeojson'
import {jsdom} from 'jsdom'
import http from 'http'
import concat from 'concat-stream'
import Map from '../models/Map'
import moment from 'moment'

function readAll (req, res) {
  Map
  .find({})
  .select('title url date date_end features')
  .sort('date')
  .exec()
  .then((maps) => res.json(maps))
}

function liveAll (req, res) {
  Map
  .find({
    date_end: {
      $gte: new Date()
    }
  })
  .select('title url date date_end features')
  .sort('date')
  .limit(1)
  .exec()
  .then((maps) => res.json(maps))
}

function live (req, res) {
  Map
  .findOne({
    date_end: {
      $gte: new Date()
    }
  })
  .sort('date')
  .then((doc) => {
    res.json(doc)
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
    console.log('create', Object.keys(fields))
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
      console.log('edit', Object.keys(fields))
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
  remove
}

export default Maps
