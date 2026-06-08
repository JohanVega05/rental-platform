const cloudinary = require('../utils/cloudinary')
const multer = require('multer')
const { Readable } = require('stream')

const storage = multer.memoryStorage()
const upload = multer({ storage })

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'rental-platform' },
      (error, result) => {
        if (error) reject(error)
        else resolve(result)
      }
    )
    Readable.from(buffer).pipe(stream)
  })
}

const uploadMiddleware = [
  upload.array('images', 10),
  async (req, res, next) => {
    try {
      if (req.files && req.files.length > 0) {
        const uploads = await Promise.all(
          req.files.map(file => uploadToCloudinary(file.buffer))
        )
        req.files = uploads.map(result => ({ path: result.secure_url }))
      }
      next()
    } catch (error) {
      res.status(500).json({ message: 'Error al subir imágenes', error: error.message })
    }
  }
]

module.exports = { uploadMiddleware }