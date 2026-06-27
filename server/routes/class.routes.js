const express = require('express');
const router = express.Router();
const { 
  getAllClasses, 
  getLiveClass, 
  getClassById, 
  createClass, 
  updateClass, 
  deleteClass 
} = require('../controllers/class.controller');
const { protect } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/admin.middleware');
const { checkContentAccess } = require('../middleware/payment.middleware');

router.get('/', protect, getAllClasses);
router.get('/live', protect, getLiveClass);

router.get(
  '/:id',
  protect,
  (req, res, next) => {
    req.params.type = 'class';
    next();
  },
  checkContentAccess,
  getClassById
);

router.post('/', protect, adminOnly, createClass);
router.put('/:id', protect, adminOnly, updateClass);
router.delete('/:id', protect, adminOnly, deleteClass);

module.exports = router;
