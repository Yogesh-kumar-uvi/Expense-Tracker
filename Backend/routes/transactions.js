const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  uploadTransactionAttachment
} = require('../controllers/transactions');

router.route('/').get(protect, getTransactions).post(protect, createTransaction);
router.route('/:id')
  .get(protect, getTransaction)
  .put(protect, updateTransaction)
  .delete(protect, deleteTransaction);
router.route('/:id/attachments').post(protect, upload.single('receipt'), uploadTransactionAttachment);

module.exports = router;