import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDB } from './config/db.js'

import authRoutes from './routes/authRoutes.js'
import farmRoutes from './routes/farmRoutes.js'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

connectDB()

app.use('/api/auth', authRoutes)
app.use('/api/farms', farmRoutes)

app.get('/', (req, res) => {
  res.send({ message: 'AgriSense Backend Running (ESM)' })
})

const port = process.env.PORT || 4000
app.listen(port, () => console.log(`Server running on port ${port}`))
