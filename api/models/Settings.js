import mongoose from 'mongoose'
import 'mongoose-geojson-schema'

var SettingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true
  },
  stringValue: {
    type: String
  },
  numberValue: {
    type: Number
  }
})

export default mongoose.model('Settings', SettingsSchema)
