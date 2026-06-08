const router = require('express').Router()
const auth = require('../middlewares/auth.middleware')
const {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getMyProperties
} = require('../controllers/properties.controller')
const { uploadMiddleware } = require('../middlewares/upload.middleware')

router.get('/', getProperties)
router.get('/my-properties', auth, getMyProperties)
router.get('/:id', getPropertyById)
router.post('/', auth, uploadMiddleware, createProperty)
router.put('/:id', auth, updateProperty)
router.delete('/:id', auth, deleteProperty)

module.exports = router