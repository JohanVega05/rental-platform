const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body
    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) return res.status(400).json({ message: 'Email ya registrado' })

    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role: role || 'GUEST' }
    })

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } })
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar', error: error.message })
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(400).json({ message: 'Credenciales incorrectas' })

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(400).json({ message: 'Credenciales incorrectas' })

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } })
  } catch (error) {
    res.status(500).json({ message: 'Error al iniciar sesión', error: error.message })
  }
}

const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } })
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role })
  } catch (error) {
    res.status(500).json({ message: 'Error', error: error.message })
  }
}

module.exports = { register, login, getMe }