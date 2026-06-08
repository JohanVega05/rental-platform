'use client'
import { useEffect, useState } from 'react'
import api from '../lib/api'
import Link from 'next/link'
import { useAuth } from '../context/AuthContext'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const { user, logout, loading } = useAuth()
  const router = useRouter()
  const [properties, setProperties] = useState<any[]>([])
  const [loadingProps, setLoadingProps] = useState(true)
  const [filters, setFilters] = useState({ location: '', minPrice: '', maxPrice: '', maxGuests: '' })

  const fetchProperties = async () => {
    setLoadingProps(true)
    try {
      const params: any = {}
      if (filters.location) params.location = filters.location
      if (filters.minPrice) params.minPrice = filters.minPrice
      if (filters.maxPrice) params.maxPrice = filters.maxPrice
      if (filters.maxGuests) params.maxGuests = filters.maxGuests
      const res = await api.get('/properties', { params })
      setProperties(res.data)
    } catch {
      console.log('Error cargando propiedades')
    } finally {
      setLoadingProps(false)
    }
  }

  useEffect(() => { fetchProperties() }, [])

  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-blue-600">RentalPlatform</h1>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm text-gray-600">Hola, {user.name}</span>
              {user.role === 'OWNER' && (
                <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">Mi panel</Link>
              )}
              {user.role === 'GUEST' && (
                <Link href="/bookings" className="text-sm text-blue-600 hover:underline">Mis reservas</Link>
              )}
              <button onClick={() => { logout(); router.push('/') }}
                className="text-sm text-gray-500 hover:text-gray-700">Salir</button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-gray-600">Entrar</Link>
              <Link href="/register" className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Registrarse</Link>
            </>
          )}
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-500 mb-1 px-1">Ubicación</label>
              <input
                placeholder="¿A dónde vas?"
                value={filters.location}
                onChange={e => setFilters({...filters, location: e.target.value})}
                className="border-2 border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-blue-400 focus:bg-white transition placeholder-gray-400"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-500 mb-1 px-1">Precio mín.</label>
              <input
                placeholder="$ mínimo"
                type="number"
                value={filters.minPrice}
                onChange={e => setFilters({...filters, minPrice: e.target.value})}
                className="border-2 border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-blue-400 focus:bg-white transition placeholder-gray-400"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-500 mb-1 px-1">Precio máx.</label>
              <input
                placeholder="$ máximo"
                type="number"
                value={filters.maxPrice}
                onChange={e => setFilters({...filters, maxPrice: e.target.value})}
                className="border-2 border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-blue-400 focus:bg-white transition placeholder-gray-400"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-500 mb-1 px-1">Personas</label>
              <input
                placeholder="¿Cuántos?"
                type="number"
                value={filters.maxGuests}
                onChange={e => setFilters({...filters, maxGuests: e.target.value})}
                className="border-2 border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-blue-400 focus:bg-white transition placeholder-gray-400"
              />
            </div>
          </div>
          <button onClick={fetchProperties}
            className="mt-4 bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
            Buscar
          </button>
        </div>

        <h3 className="text-sm font-semibold text-gray-500 mb-4">
          {loadingProps ? 'Cargando...' : `${properties.length} propiedades disponibles`}
        </h3>

        {loadingProps ? (
          <div className="text-center py-20 text-gray-400">Cargando propiedades...</div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No hay propiedades disponibles</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {properties.map((property: any) => (
              <Link key={property.id} href={`/properties/${property.id}`}>
                <div className="bg-white rounded-2xl border-2 border-gray-300 overflow-hidden hover:shadow-lg transition cursor-pointer shadow-md">
                  <div className="h-48 bg-gray-100 overflow-hidden">
                    {property.images?.[0] ? (
                      <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">Sin imagen</div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-800 mb-1">{property.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">{property.location}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-600 font-semibold">${property.price}<span className="text-gray-400 font-normal text-xs">/noche</span></span>
                      <span className="text-xs text-gray-400">{property.maxGuests} personas</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}