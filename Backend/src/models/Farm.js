import mongoose from 'mongoose'

const farmSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: String,
  polygon: { type: [[Number]] },
  crop: String,
  center: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  }
});


farmSchema.index({ polygon: '2dsphere' })

export default mongoose.model('Farm', farmSchema)
