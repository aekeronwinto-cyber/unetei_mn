const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/carController');
const upload = require('../middleware/upload');

router.get('/',       ctrl.getAll);
router.get('/:id',    ctrl.getOne);
router.post('/',      upload.array('images', 10), ctrl.create);
router.put('/:id',    ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;