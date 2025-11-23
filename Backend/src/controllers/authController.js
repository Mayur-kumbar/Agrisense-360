import bcrypt from 'bcrypt'
import User from '../models/User.js'
import { generateToken } from '../utils/jwt.js'

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body

    const exists = await User.findOne({ email })
    if (exists) return res.status(400).json({ message: 'Email already exists' })

    const hash = await bcrypt.hash(password, 10)

    const user = await User.create({
      name,
      email,
      passwordHash: hash
    })

    res.json({ message: 'User registered', userId: user._id })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ message: 'Invalid credentials' })

    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' })

    const token = generateToken(user._id, user.role)
    res.json({ token })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}
