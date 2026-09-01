import express from 'express';
import {
  createAnnouncementAdmin,
  getAllAnnouncementsAdmin,
  getMyAnnouncements,
  deleteAnnouncementAdmin,
} from '../controllers/announcementController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

// Public / User / Staff feed of announcements
router.get('/my', getMyAnnouncements);

// Admin announcement management
router.get('/all', adminOnly, getAllAnnouncementsAdmin);
router.post('/', adminOnly, createAnnouncementAdmin);
router.delete('/:id', adminOnly, deleteAnnouncementAdmin);

export default router;
