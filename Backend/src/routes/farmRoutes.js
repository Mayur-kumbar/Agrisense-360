import { Router } from 'express'
import { requireAuth } from '../middleware/authMiddleware.js'
import { createFarm, getMyFarms } from '../controllers/farmController.js'

const router = Router()

router.post('/createFarm', requireAuth, createFarm)
router.get('/getFarms', requireAuth, getMyFarms)

export default router
