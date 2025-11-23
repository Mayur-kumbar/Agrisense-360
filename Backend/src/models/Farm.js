import mongoose from 'mongoose'

const FarmSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  polygon: Object, // GeoJSON
  crop: String,
  center: {
    type: [Number], // [lat, lng]
    default: [0, 0]
  }
}, { timestamps: true })

FarmSchema.index({ polygon: '2dsphere' })

export default mongoose.model('Farm', FarmSchema)
