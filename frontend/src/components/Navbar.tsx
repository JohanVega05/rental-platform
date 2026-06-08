'use client'
import Link from 'next/link'
import { useAuth } from '../context/AuthContext'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const { user, logout } = useAuth()
  const router = useRouter()

  return (
    <nav className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
      <Link href="/" className="text-xl font-semibold text-blue-600">RentalPlatform</Link>
      <div className="flex items-center gap-4">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">← Inicio</Link>
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
  )
}