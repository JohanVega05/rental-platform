const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const getProperties = async (req, res) => {
  try {
    const { location, minPrice, maxPrice, maxGuests } = req.query

    const filters = { isActive: true }
    if (location) filters.location = { contains: location, mode: 'insensitive' }
    if (maxGuests) filters.maxGuests = { gte: parseInt(maxGuests) }
    if (minPrice || maxPrice) {
      filters.price = {}
      if (minPrice) filters.price.gte = parseFloat(minPrice)
      if (maxPrice) filters.price.lte = parseFloat(maxPrice)
    }

    const properties = await prisma.property.findMany({
      where: filters,
      include: { owner: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    })

    res.json(properties)
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener propiedades', error: error.message })
  }
}

const getPropertyById = async (req, res) => {
  try {
    const property = await prisma.property.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        reviews: { include: { user: { select: { id: true, name: true } } } },
        bookings: { select: { startDate: true, endDate: true, status: true } }
      }
    })
    if (!property) return res.status(404).json({ message: 'Propiedad no encontrada' })
    res.json(property)
  } catch (error) {
    res.status(500).json({ message: 'Error', error: error.message })
  }
}

const createProperty = async (req, res) => {
  try {
    const { title, description, location, price, maxGuests, rules } = req.body
    const images = req.files ? req.files.map(f => f.path) : []

    const property = await prisma.property.create({
      data: {
        title,
        description,
        location,
        price: parseFloat(price),
        maxGuests: parseInt(maxGuests),
        rules,
        images,
        ownerId: req.user.id
      }
    })
    res.status(201).json(property)
  } catch (error) {
    console.log('ERROR CREAR PROPIEDAD:', error.message)
    res.status(500).json({ message: 'Error al crear propiedad', error: error.message })
  }
}

const updateProperty = async (req, res) => {
  try {
    const property = await prisma.property.findUnique({
      where: { id: parseInt(req.params.id) }
    })
    if (!property) return res.status(404).json({ message: 'No encontrada' })
    if (property.ownerId !== req.user.id) return res.status(403).json({ message: 'No autorizado' })

    const updated = await prisma.property.update({
      where: { id: parseInt(req.params.id) },
      data: req.body
    })
    res.json(updated)
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar', error: error.message })
  }
}

const deleteProperty = async (req, res) => {
  try {
    const property = await prisma.property.findUnique({
      where: { id: parseInt(req.params.id) }
    })
    if (!property) return res.status(404).json({ message: 'No encontrada' })
    if (property.ownerId !== req.user.id) return res.status(403).json({ message: 'No autorizado' })

    await prisma.property.delete({ where: { id: parseInt(req.params.id) } })
    res.json({ message: 'Propiedad eliminada' })
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar', error: error.message })
  }
}

const getMyProperties = async (req, res) => {
  try {
    const properties = await prisma.property.findMany({
      where: { ownerId: req.user.id },
      include: { bookings: true, reviews: true }
    })
    res.json(properties)
  } catch (error) {
    res.status(500).json({ message: 'Error', error: error.message })
  }
}

module.exports = { getProperties, getPropertyById, createProperty, updateProperty, deleteProperty, getMyProperties }