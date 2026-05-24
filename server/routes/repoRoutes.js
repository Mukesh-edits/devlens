const express = require('express');
const router = express.Router();
const { 
  analyzeRepo, 
  getUserRepos, 
  getRepo,
  indexRepo,
  chatWithRepo
} = require('../controllers/repoController');
const { protect } = require('../middleware/authMiddleware');

router.post('/analyze', protect, analyzeRepo);
router.get('/', protect, getUserRepos);
router.get('/:id', protect, getRepo);
router.post('/:id/index', protect, indexRepo);
router.post('/:id/chat', protect, chatWithRepo);

module.exports = router;