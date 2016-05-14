import mongoose from 'mongoose'
import 'mongoose-geojson-schema'

var MapSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  date_end: {
    type: Date,
    default: Date.now
  },
  course: {
    type: mongoose.Schema.Types.LineString,
    required: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date,
    default: Date.now
  }
})

export default mongoose.model('Map', MapSchema)
