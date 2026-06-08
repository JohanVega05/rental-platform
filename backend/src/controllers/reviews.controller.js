const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const createReview = async (req, res) => {
  try {
    const { propertyId, rating, comment } = req.body

    const booking = await prisma.booking.findFirst({
      where: {
        propertyId: parseInt(propertyId),
        guestId: req.user.id,
        status: 'CONFIRMED'
      }
    })
    if (!booking) return res.status(400).json({ message: 'Solo puedes reseñar propiedades donde te hospedaste' })

    const existing = await prisma.review.findFirst({
      where: { propertyId: parseInt(propertyId), userId: req.user.id }
    })
    if (existing) return res.status(400).json({ message: 'Ya dejaste una reseña para esta propiedad' })

    const review = await prisma.review.create({
      data: {
        propertyId: parseInt(propertyId),
        userId: req.user.id,
        rating: parseInt(rating),
        comment
      },
      include: { user: { select: { id: true, name: true } } }
    })
    res.status(201).json(review)
  } catch (error) {
    res.status(500).json({ message: 'Error al crear reseña', error: error.message })
  }
}

const getPropertyReviews = async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { propertyId: parseInt(req.params.propertyId) },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' }
    })
    res.json(reviews)
  } catch (error) {
    res.status(500).json({ message: 'Error', error: error.message })
  }
}

module.exports = { createReview, getPropertyReviews }