const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

// Rutas
app.use('/api/auth', require('./routes/auth.routes'))
app.use('/api/properties', require('./routes/properties.routes'))
app.use('/api/bookings', require('./routes/bookings.routes'))
app.use('/api/reviews', require('./routes/reviews.routes'))

app.get('/', (req, res) => {
  res.json({ message: 'Rental Platform API funcionando' })
})

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})