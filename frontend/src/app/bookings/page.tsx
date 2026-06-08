'use client'
import { useEffect, useState } from 'react'
import api from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Link from 'next/link'
import Navbar from '../../components/Navbar'

export default function BookingsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { router.push('/login'); return }
    api.get('/bookings/my-bookings')
      .then(res => setBookings(res.data))
      .catch(() => toast.error('Error cargando reservas'))
      .finally(() => setLoading(false))
  }, [user])

  const cancelBooking = async (id: number) => {
    try {
      await api.put(`/bookings/${id}/cancel`)
      toast.success('Reserva cancelada')
      setBookings(bookings.map((b: any) => b.id === id ? {...b, status: 'CANCELLED'} : b))
    } catch {
      toast.error('Error al cancelar')
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Mis reservas</h1>
        {bookings.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 mb-4">No tienes reservas aún</p>
            <Link href="/" className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm">
              Buscar propiedades
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b: any) => (
              <div key={b.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-gray-800">{b.property?.title}</h3>
                  <p className="text-sm text-gray-500">{b.property?.location}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(b.startDate).toLocaleDateString()} → {new Date(b.endDate).toLocaleDateString()}
                  </p>
                  <p className="text-blue-600 font-semibold mt-1">${b.totalPrice}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-3 py-1 rounded-full ${
                    b.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                    b.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>{b.status}</span>
                  {b.status === 'PENDING' && (
                    <button onClick={() => cancelBooking(b.id)}
                      className="text-xs bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600">
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}