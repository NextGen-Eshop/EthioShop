import express from 'express';
import { getPublicSettings } from '../controllers/settingController.js';

const router = express.Router();

// GET /api/settings - Public storefront settings
router.get('/', getPublicSettings);

export default router;
