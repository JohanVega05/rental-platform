'use client'
import { useState } from 'react'
import api from '../../../lib/api'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../context/AuthContext'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function NewPropertyPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<FileList | null>(null)
  const [form, setForm] = useState({
    title: '', description: '', location: '',
    price: '', maxGuests: '', rules: ''
  })

  if (!user || user.role !== 'OWNER') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Solo propietarios pueden publicar propiedades. <Link href="/" className="text-blue-600">Volver</Link></p>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const formData = new FormData()
      Object.entries(form).forEach(([key, value]) => formData.append(key, value))
      if (images) Array.from(images).forEach(img => formData.append('images', img))

      await api.post('/properties', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success('Propiedad publicada')
      router.push('/dashboard')
    } catch {
      toast.error('Error al publicar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-semibold text-blue-600">RentalPlatform</Link>
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">← Volver al panel</Link>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Publicar propiedad</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Título</label>
            <input type="text" value={form.title}
              onChange={e => setForm({...form, title: e.target.value})}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400"
              required />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Descripción</label>
            <textarea value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
              rows={4}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400"
              required />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Ubicación</label>
            <input type="text" value={form.location}
              onChange={e => setForm({...form, location: e.target.value})}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400"
              required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Precio por noche ($)</label>
              <input type="number" value={form.price}
                onChange={e => setForm({...form, price: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400"
                required />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Máximo de personas</label>
              <input type="number" value={form.maxGuests}
                onChange={e => setForm({...form, maxGuests: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400"
                required />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Reglas de la propiedad</label>
            <textarea value={form.rules}
              onChange={e => setForm({...form, rules: e.target.value})}
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400"
              placeholder="No fumar, no mascotas..." />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Imágenes</label>
            <input type="file" multiple accept="image/*"
              onChange={e => setImages(e.target.files)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50">
            {loading ? 'Publicando...' : 'Publicar propiedad'}
          </button>
        </form>
      </div>
    </div>
  )
}