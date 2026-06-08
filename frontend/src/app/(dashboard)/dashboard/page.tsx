'use client'
import { useEffect, useState } from 'react'
import api from '../../../lib/api'
import { useAuth } from '../../../context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import Navbar from '../../../components/Navbar'

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [properties, setProperties] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    if (user.role !== 'OWNER') { router.push('/'); return }
    Promise.all([
      api.get('/properties/my-properties'),
      api.get('/bookings/owner-bookings')
    ]).then(([propsRes, bookingsRes]) => {
      setProperties(propsRes.data)
      setBookings(bookingsRes.data)
    }).catch(() => toast.error('Error cargando datos'))
      .finally(() => setLoading(false))
  }, [user])

  const updateBookingStatus = async (id: number, status: string) => {
    try {
      await api.put(`/bookings/${id}/status`, { status })
      toast.success('Reserva actualizada')
      const res = await api.get('/bookings/owner-bookings')
      setBookings(res.data)
    } catch {
      toast.error('Error al actualizar')
    }
  }

  const deleteProperty = async (id: number) => {
    if (!confirm('¿Seguro que quieres eliminar esta propiedad?')) return
    try {
      await api.delete(`/properties/${id}`)
      toast.success('Propiedad eliminada')
      setProperties(properties.filter((p: any) => p.id !== id))
    } catch {
      toast.error('Error al eliminar')
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-800">Mi panel</h1>
          <Link href="/properties/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            + Nueva propiedad
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border-2 border-gray-300 p-4 shadow-md">
            <p className="text-sm text-gray-500">Propiedades activas</p>
            <p className="text-3xl font-semibold text-gray-800 mt-1">{properties.length}</p>
          </div>
          <div className="bg-white rounded-2xl border-2 border-gray-300 p-4 shadow-md">
            <p className="text-sm text-gray-500">Reservas totales</p>
            <p className="text-3xl font-semibold text-gray-800 mt-1">{bookings.length}</p>
          </div>
          <div className="bg-white rounded-2xl border-2 border-gray-300 p-4 shadow-md">
            <p className="text-sm text-gray-500">Pendientes</p>
            <p className="text-3xl font-semibold text-gray-800 mt-1">
              {bookings.filter((b: any) => b.status === 'PENDING').length}
            </p>
          </div>
        </div>

        <h2 className="text-lg font-medium text-gray-800 mb-4">Mis propiedades</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {properties.length === 0 ? (
            <p className="text-gray-400 text-sm">No tienes propiedades aún</p>
          ) : properties.map((p: any) => (
            <div key={p.id} className="bg-white rounded-2xl border-2 border-gray-300 p-4 shadow-md">
              <h3 className="font-medium text-gray-800">{p.title}</h3>
              <p className="text-sm text-gray-500">{p.location}</p>
              <p className="text-blue-600 font-semibold mt-1">${p.price}/noche</p>
              <p className="text-xs text-gray-400 mt-1">{p.bookings?.length || 0} reservas</p>
              <div className="flex gap-2 mt-3">
                <Link href={`/properties/${p.id}/edit`}
                  className="text-xs bg-gray-100 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition">
                  Editar
                </Link>
                <button onClick={() => deleteProperty(p.id)}
                  className="text-xs bg-red-50 border border-red-200 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 transition">
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>

        <h2 className="text-lg font-medium text-gray-800 mb-4">Reservas recibidas</h2>
        <div className="space-y-3">
          {bookings.length === 0 ? (
            <p className="text-gray-400 text-sm">No hay reservas aún</p>
          ) : bookings.map((b: any) => (
            <div key={b.id} className="bg-white rounded-2xl border-2 border-gray-300 p-4 shadow-md flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-800">{b.property?.title}</p>
                <p className="text-sm text-gray-500">Huésped: {b.guest?.name}</p>
                <p className="text-sm text-gray-500">
                  {new Date(b.startDate).toLocaleDateString()} → {new Date(b.endDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-blue-600 font-medium">${b.totalPrice}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  b.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                  b.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>{b.status}</span>
                {b.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <button onClick={() => updateBookingStatus(b.id, 'CONFIRMED')}
                      className="text-xs bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700">
                      Confirmar
                    </button>
                    <button onClick={() => updateBookingStatus(b.id, 'CANCELLED')}
                      className="text-xs bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600">
                      Rechazar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}