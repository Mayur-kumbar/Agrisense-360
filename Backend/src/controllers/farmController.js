import Farm from '../models/Farm.js'

export const createFarm = async (req, res) => {
  try {
    const { name, polygon, crop, center } = req.body

    const farm = await Farm.create({
      owner: req.userId,
      name,
      polygon,
      crop,
      center
    })

    res.json(farm)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const getMyFarms = async (req, res) => {
  try {
    const farms = await Farm.find({ owner: req.userId })
    res.json(farms)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
