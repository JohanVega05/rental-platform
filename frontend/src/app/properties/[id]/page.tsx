'use client'
import { useEffect, useState } from 'react'
import api from '../../../lib/api'
import { useAuth } from '../../../context/AuthContext'
import { useRouter, useParams } from 'next/navigation'
import toast from 'react-hot-toast'
import Link from 'next/link'
import Navbar from '../../../components/Navbar'

export default function PropertyPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const [property, setProperty] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState({ startDate: '', endDate: '' })
  const [bookingLoading, setBookingLoading] = useState(false)
  const [review, setReview] = useState({ rating: '5', comment: '' })
  const [reviewLoading, setReviewLoading] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get(`/properties/${params.id}`),
      api.get(`/reviews/property/${params.id}`)
    ]).then(([propRes, reviewsRes]) => {
      setProperty(propRes.data)
      setReviews(reviewsRes.data)
    }).catch(() => toast.error('Error cargando propiedad'))
      .finally(() => setLoading(false))
  }, [params.id])

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) { router.push('/login'); return }
    setBookingLoading(true)
    try {
      await api.post('/bookings', {
        propertyId: property.id,
        startDate: booking.startDate,
        endDate: booking.endDate
      })
      toast.success('Reserva creada exitosamente')
      router.push('/bookings')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al reservar')
    } finally {
      setBookingLoading(false)
    }
  }

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault()
    setReviewLoading(true)
    try {
      const res = await api.post('/reviews', {
        propertyId: property.id,
        rating: review.rating,
        comment: review.comment
      })
      setReviews([res.data, ...reviews])
      setReview({ rating: '5', comment: '' })
      toast.success('Reseña publicada')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al publicar reseña')
    } finally {
      setReviewLoading(false)
    }
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : null

  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>
  if (!property) return <div className="min-h-screen flex items-center justify-center">No encontrada</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <div className="bg-white rounded-2xl border-2 border-gray-300 overflow-hidden shadow-md">
          {property.images?.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 p-4">
              {property.images.map((img: string, i: number) => (
                <img key={i} src={img} alt={property.title} className="w-full h-48 object-cover rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="h-64 bg-gray-100 flex items-center justify-center text-gray-400 border-b-2 border-gray-200">Sin imágenes</div>
          )}
          <div className="p-6">
            <div className="flex justify-between items-start mb-2">
              <h1 className="text-2xl font-semibold text-gray-800">{property.title}</h1>
              {avgRating && (
                <span className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">
                  ★ {avgRating} ({reviews.length} reseñas)
                </span>
              )}
            </div>
            <p className="text-gray-500 mb-4"> {property.location}</p>
            <div className="flex gap-6 mb-4">
              <span className="text-blue-600 font-semibold text-xl">${property.price}<span className="text-gray-400 text-sm font-normal">/noche</span></span>
              <span className="text-gray-500 text-sm self-center">{property.maxGuests} personas máximo</span>
            </div>
            <p className="text-gray-600 mb-4">{property.description}</p>
            {property.rules && (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-1">Reglas</p>
                <p className="text-sm text-gray-500">{property.rules}</p>
              </div>
            )}
          </div>
        </div>

        {user?.role === 'GUEST' && (
          <div className="bg-white rounded-2xl border-2 border-gray-300 p-6 shadow-md">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Reservar esta propiedad</h2>
            <form onSubmit={handleBooking} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Fecha de entrada</label>
                  <input type="date" value={booking.startDate}
                    onChange={e => setBooking({...booking, startDate: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full border-2 border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition"
                    required />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Fecha de salida</label>
                  <input type="date" value={booking.endDate}
                    onChange={e => setBooking({...booking, endDate: e.target.value})}
                    min={booking.startDate || new Date().toISOString().split('T')[0]}
                    className="w-full border-2 border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition"
                    required />
                </div>
              </div>
              {booking.startDate && booking.endDate && (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <p className="text-sm text-blue-700">Total estimado: <span className="font-semibold">
                    ${Math.ceil((new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / (1000*60*60*24)) * property.price}
                  </span></p>
                </div>
              )}
              <button type="submit" disabled={bookingLoading}
                className="w-full bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50">
                {bookingLoading ? 'Reservando...' : 'Confirmar reserva'}
              </button>
            </form>
          </div>
        )}

        {!user && (
          <div className="bg-white rounded-2xl border-2 border-gray-300 p-6 shadow-md text-center">
            <p className="text-gray-500 mb-4">Inicia sesión para reservar esta propiedad</p>
            <Link href="/login" className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700">
              Iniciar sesión
            </Link>
          </div>
        )}

        <div className="bg-white rounded-2xl border-2 border-gray-300 p-6 shadow-md">
          <h2 className="text-lg font-medium text-gray-800 mb-4">
            Reseñas {reviews.length > 0 && <span className="text-gray-400 font-normal text-sm">({reviews.length})</span>}
          </h2>

          {user?.role === 'GUEST' && (
            <form onSubmit={handleReview} className="mb-6 pb-6 border-b border-gray-200 space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Calificación</label>
                <select value={review.rating}
                  onChange={e => setReview({...review, rating: e.target.value})}
                  className="border-2 border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400">
                  <option value="5">★★★★★ Excelente</option>
                  <option value="4">★★★★ Muy bueno</option>
                  <option value="3">★★★ Bueno</option>
                  <option value="2">★★ Regular</option>
                  <option value="1">★ Malo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Comentario</label>
                <textarea value={review.comment}
                  onChange={e => setReview({...review, comment: e.target.value})}
                  rows={3} required
                  className="w-full border-2 border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition"
                  placeholder="Cuenta tu experiencia..." />
              </div>
              <button type="submit" disabled={reviewLoading}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50">
                {reviewLoading ? 'Publicando...' : 'Publicar reseña'}
              </button>
            </form>
          )}

          {reviews.length === 0 ? (
            <p className="text-gray-400 text-sm">No hay reseñas aún</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((r: any) => (
                <div key={r.id} className="border-b border-gray-100 pb-4 last:border-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-gray-700 text-sm">{r.user?.name}</span>
                    <span className="text-yellow-500 text-sm">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  </div>
                  <p className="text-gray-500 text-sm">{r.comment}</p>
                  <p className="text-gray-300 text-xs mt-1">{new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}