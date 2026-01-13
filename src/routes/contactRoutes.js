const express = require('express');
const contactController = require('../controllers/contactController');

const router = express.Router();

router.get('/', contactController.getAll);
router.get('/:id', contactController.getById);
router.post('/', contactController.create);
router.put('/:id', contactController.update);
router.delete('/:id', contactController.remove);

module.exports = router;

