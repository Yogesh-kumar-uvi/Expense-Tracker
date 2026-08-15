const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getGoals,
  getGoal,
  createGoal,
  updateGoal,
  deleteGoal,
} = require('../controllers/goals');

router.route('/').get(protect, getGoals).post(protect, createGoal);
router.route('/:id')
  .get(protect, getGoal)
  .put(protect, updateGoal)
  .delete(protect, deleteGoal);

module.exports = router;