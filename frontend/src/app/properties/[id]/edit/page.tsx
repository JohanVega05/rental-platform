'use client'
import { useEffect, useState } from 'react'
import api from '../../../../lib/api'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '../../../../context/AuthContext'
import toast from 'react-hot-toast'
import Navbar from '../../../../components/Navbar'

export default function EditPropertyPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', location: '',
    price: '', maxGuests: '', rules: ''
  })

  useEffect(() => {
    api.get(`/properties/${params.id}`)
      .then(res => {
        const p = res.data
        setForm({
          title: p.title,
          description: p.description,
          location: p.location,
          price: p.price.toString(),
          maxGuests: p.maxGuests.toString(),
          rules: p.rules || ''
        })
      })
      .catch(() => toast.error('Error cargando propiedad'))
      .finally(() => setLoading(false))
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put(`/properties/${params.id}`, {
        title: form.title,
        description: form.description,
        location: form.location,
        price: parseFloat(form.price),
        maxGuests: parseInt(form.maxGuests),
        rules: form.rules
      })
      toast.success('Propiedad actualizada')
      router.push('/dashboard')
    } catch {
      toast.error('Error al actualizar')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Editar propiedad</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border-2 border-gray-300 p-6 shadow-md space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Título</label>
            <input type="text" value={form.title}
              onChange={e => setForm({...form, title: e.target.value})}
              className="w-full border-2 border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition"
              required />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Descripción</label>
            <textarea value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
              rows={4}
              className="w-full border-2 border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition"
              required />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Ubicación</label>
            <input type="text" value={form.location}
              onChange={e => setForm({...form, location: e.target.value})}
              className="w-full border-2 border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition"
              required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Precio por noche ($)</label>
              <input type="number" value={form.price}
                onChange={e => setForm({...form, price: e.target.value})}
                className="w-full border-2 border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition"
                required />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Máximo de personas</label>
              <input type="number" value={form.maxGuests}
                onChange={e => setForm({...form, maxGuests: e.target.value})}
                className="w-full border-2 border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition"
                required />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Reglas</label>
            <textarea value={form.rules}
              onChange={e => setForm({...form, rules: e.target.value})}
              rows={3}
              className="w-full border-2 border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition"
              placeholder="No fumar, no mascotas..." />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="flex-1 bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50">
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
            <button type="button" onClick={() => router.push('/dashboard')}
              className="flex-1 bg-gray-100 border border-gray-200 text-gray-600 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-200 transition">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}