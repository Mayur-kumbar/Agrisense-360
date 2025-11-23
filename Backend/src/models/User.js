import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  passwordHash: String,
  role: { type: String, enum: ['farmer', 'admin'], default: 'farmer' },
  preferredLanguage: { type: String, default: 'en' }
}, { timestamps: true })

export default mongoose.model('User', UserSchema)
