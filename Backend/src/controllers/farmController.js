import Farm from '../models/Farm.js'

export const createFarm = async (req, res) => {
  try {
    const { name, polygon, crop, center } = req.body;

    // normalize center
    let normalizedCenter = null;
    if (Array.isArray(center) && center.length >= 2) {
      // assume [lng, lat]
      normalizedCenter = [Number(center[0]), Number(center[1])];
    } else if (center && typeof center === 'object') {
      // object like { lat, lng } or GeoJSON
      if (center.lat != null && center.lng != null) {
        normalizedCenter = [Number(center.lng), Number(center.lat)];
      } else if (Array.isArray(center.coordinates)) {
        // GeoJSON { type: 'Point', coordinates: [lng, lat] }
        normalizedCenter = [Number(center.coordinates[0]), Number(center.coordinates[1])];
      }
    }

    if (!normalizedCenter) {
      return res.status(400).json({ message: 'Invalid center format. Send [lng,lat] or { lat, lng } or GeoJSON Point.' });
    }

    const farm = await Farm.create({
      owner: req.userId,
      name,
      polygon,
      crop,
      center: normalizedCenter
    });

    res.json(farm);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const getMyFarms = async (req, res) => {
  try {
    const farms = await Farm.find({ owner: req.userId })
    res.json(farms)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
