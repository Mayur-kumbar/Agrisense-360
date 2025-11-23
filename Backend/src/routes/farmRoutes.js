import { Router } from 'express'
import { authMiddleware } from '../middleware/authMiddleware.js'
import { createFarm, getMyFarms } from '../controllers/farmController.js'

const router = Router()

router.post('/', authMiddleware, createFarm)
router.get('/', authMiddleware, getMyFarms)

export default router
