const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const createBooking = async (req, res) => {
  try {
    const { propertyId, startDate, endDate } = req.body

    const property = await prisma.property.findUnique({
      where: { id: parseInt(propertyId) }
    })
    if (!property) return res.status(404).json({ message: 'Propiedad no encontrada' })
    if (property.ownerId === req.user.id) return res.status(400).json({ message: 'No puedes reservar tu propia propiedad' })

    const conflict = await prisma.booking.findFirst({
      where: {
        propertyId: parseInt(propertyId),
        status: { not: 'CANCELLED' },
        OR: [
          { startDate: { lte: new Date(endDate) }, endDate: { gte: new Date(startDate) } }
        ]
      }
    })
    if (conflict) return res.status(400).json({ message: 'Fechas no disponibles' })

    const nights = Math.ceil(
      (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
    )
    const totalPrice = nights * property.price

    const booking = await prisma.booking.create({
      data: {
        propertyId: parseInt(propertyId),
        guestId: req.user.id,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        totalPrice
      }
    })
    res.status(201).json(booking)
  } catch (error) {
    res.status(500).json({ message: 'Error al crear reserva', error: error.message })
  }
}

const getMyBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { guestId: req.user.id },
      include: {
        property: { select: { id: true, title: true, location: true, images: true, price: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
    res.json(bookings)
  } catch (error) {
    res.status(500).json({ message: 'Error', error: error.message })
  }
}

const getPropertyBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { propertyId: parseInt(req.params.propertyId) },
      include: {
        guest: { select: { id: true, name: true, email: true } }
      }
    })
    res.json(bookings)
  } catch (error) {
    res.status(500).json({ message: 'Error', error: error.message })
  }
}

const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { property: true }
    })
    if (!booking) return res.status(404).json({ message: 'Reserva no encontrada' })
    if (booking.property.ownerId !== req.user.id) return res.status(403).json({ message: 'No autorizado' })

    const updated = await prisma.booking.update({
      where: { id: parseInt(req.params.id) },
      data: { status }
    })
    res.json(updated)
  } catch (error) {
    res.status(500).json({ message: 'Error', error: error.message })
  }
}

const cancelBooking = async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(req.params.id) }
    })
    if (!booking) return res.status(404).json({ message: 'Reserva no encontrada' })
    if (booking.guestId !== req.user.id) return res.status(403).json({ message: 'No autorizado' })
    if (booking.status === 'CANCELLED') return res.status(400).json({ message: 'Ya cancelada' })

    const updated = await prisma.booking.update({
      where: { id: parseInt(req.params.id) },
      data: { status: 'CANCELLED' }
    })
    res.json(updated)
  } catch (error) {
    res.status(500).json({ message: 'Error al cancelar', error: error.message })
  }
}

const getOwnerBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        property: { ownerId: req.user.id }
      },
      include: {
        property: { select: { id: true, title: true, location: true } },
        guest: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
    res.json(bookings)
  } catch (error) {
    res.status(500).json({ message: 'Error', error: error.message })
  }
}

module.exports = { createBooking, getMyBookings, getPropertyBookings, updateBookingStatus, cancelBooking, getOwnerBookings }