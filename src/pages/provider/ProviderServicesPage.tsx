import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useProviderAuthStore } from '@/stores/providerAuthStore'
import { apiClient } from '@/lib/apiClient'
import { formatPrice } from '@/lib/formatters'
import { toast } from 'sonner'

interface ProviderService {
  id: string
  type: string
  name: string
  description: string
  imageUrl: string
  location: string
  country: string
  price: number
  currency: string
  isActive: boolean
}

interface ServicesResponse { page: number; limit: number; total: number; items: ProviderService[] }

interface ServiceForm {
  id?: string
  name: string
  description: string
  imageUrl: string
  location: string
  country: string
  price: string
}

const EMPTY_FORM: ServiceForm = { name: '', description: '', imageUrl: '', location: '', country: 'Cameroun', price: '' }

export function ProviderServicesPage() {
  const { currentServiceType, provider } = useProviderAuthStore()
  const isVerified = provider?.isVerified ?? false
  const qc = useQueryClient()

  // Use the provider's registered business type for better context
  const providerBusinessType = provider?.businessType?.toLowerCase() || currentServiceType
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState<ServiceForm>(EMPTY_FORM)

  const { data, isLoading, isError } = useQuery<ServicesResponse>({
    queryKey: ['provider-services'],
    queryFn: () => apiClient.get<ServicesResponse>('/providers/services?limit=100'),
  })

  const services = (data?.items ?? []).filter(s => s.type.toLowerCase() === currentServiceType)

  const saveMutation = useMutation({
    mutationFn: async (f: ServiceForm) => {
      const payload = {
        type: currentServiceType.toUpperCase(),
        name: f.name,
        description: f.description,
        imageUrl: f.imageUrl || 'https://placehold.co/600x400',
        location: f.location,
        country: f.country,
        price: Number(f.price),
      }
      if (f.id) return apiClient.patch(`/providers/services/${f.id}`, payload)
      return apiClient.post('/providers/services', payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['provider-services'] })
      setDialogOpen(false)
      setForm(EMPTY_FORM)
      toast.success('Service enregistré')
    },
    onError: (err: unknown) => toast.error(err instanceof Error ? err.message : 'Échec de l\'enregistrement'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/providers/services/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['provider-services'] })
      toast.success('Service désactivé')
    },
    onError: (err: unknown) => toast.error(err instanceof Error ? err.message : 'Échec de la suppression'),
  })

  const getServiceTitle = (type: string) => {
    const titles: Record<string, { 
      title: string; 
      subtitle: string; 
      addLabel: string;
      fields: string[];
    }> = {
      hotel: { 
        title: 'Vos offres hôtelières', 
        subtitle: 'Gérez chambres, équipements et tarifs', 
        addLabel: 'Ajouter une chambre',
        fields: ['type', 'capacity', 'amenities']
      },
      guide: { 
        title: 'Vos circuits touristiques', 
        subtitle: 'Gérez vos tours, expériences et tarifs', 
        addLabel: 'Ajouter un circuit',
        fields: ['duration', 'groupSize', 'languages']
      },
      transport: { 
        title: 'Vos véhicules', 
        subtitle: 'Gérez véhicules, itinéraires et tarifs', 
        addLabel: 'Ajouter un véhicule',
        fields: ['vehicleType', 'capacity', 'routes']
      },
      restaurant: { 
        title: 'Votre menu', 
        subtitle: 'Gérez les éléments du menu et leurs prix', 
        addLabel: 'Ajouter un plat',
        fields: ['cuisine', 'dietary', 'preparationTime']
      },
      events: { 
        title: 'Vos espaces événementiels', 
        subtitle: 'Gérez espaces, formules et tarifs', 
        addLabel: 'Ajouter un espace',
        fields: ['capacity', 'eventType', 'equipment']
      },
    }
    return titles[type] || titles.hotel
  }

  const isHotelProvider = currentServiceType === 'hotel'
  const config = getServiceTitle(providerBusinessType)

  // Load rooms when hotel service is available
  useEffect(() => {
    if (isHotelProvider && currentHotelService) {
      loadRooms()
    }
  }, [services, isHotelProvider])

  const openCreate = () => { setForm(EMPTY_FORM); setDialogOpen(true) }

  const getFieldHint = () => {
    if (config.fields.includes('capacity')) return "Ajoutez la capacité et les équipements pour une meilleure visibilité."
    if (config.fields.includes('duration')) return "Précisez la durée et les langues parlées."
    if (config.fields.includes('vehicleType')) return "Indiquez le type de véhicule et les trajets proposés."
    if (config.fields.includes('cuisine')) return "Précisez le type de cuisine et les options diététiques."
    if (config.fields.includes('eventType')) return "Décrivez les types d'événements et l'équipement disponible."
    return "Remplissez les informations pour attirer plus de clients."
  }
  const openEdit = (s: ProviderService) => {
    setForm({ id: s.id, name: s.name, description: s.description, imageUrl: s.imageUrl, location: s.location, country: s.country, price: String(s.price) })
    setDialogOpen(true)
  }

  // Generalized management for all service types
  const managementConfig: Record<string, any> = {
    hotel: {
      title: 'Gestion des chambres',
      addLabel: 'Ajouter une chambre',
      itemKey: 'rooms',
      fields: ['name', 'price', 'maxGuests', 'available', 'amenities'],
      defaultItem: { name: '', price: '', maxGuests: '2', available: '5', amenities: '' }
    },
    transport: {
      title: 'Gestion des véhicules',
      addLabel: 'Ajouter un véhicule',
      itemKey: 'vehicles',
      fields: ['name', 'price', 'capacity', 'routes'],
      defaultItem: { name: '', price: '', capacity: '4', routes: '' }
    },
    restaurant: {
      title: 'Gestion du menu',
      addLabel: 'Ajouter un plat',
      itemKey: 'menu',
      fields: ['name', 'price', 'cuisine', 'preparationTime'],
      defaultItem: { name: '', price: '', cuisine: '', preparationTime: '' }
    },
    guide: {
      title: 'Gestion des circuits',
      addLabel: 'Ajouter un circuit',
      itemKey: 'tours',
      fields: ['name', 'price', 'duration', 'groupSize'],
      defaultItem: { name: '', price: '', duration: '', groupSize: '' }
    },
    events: {
      title: 'Gestion des espaces',
      addLabel: 'Ajouter un espace',
      itemKey: 'spaces',
      fields: ['name', 'price', 'capacity', 'eventType'],
      defaultItem: { name: '', price: '', capacity: '', eventType: '' }
    }
  }

  const currentConfig = managementConfig[currentServiceType] || managementConfig.hotel
  const currentService = services[0]
  const [items, setItems] = useState<any[]>([])
  const [showItemDialog, setShowItemDialog] = useState(false)
  const [itemForm, setItemForm] = useState<any>({})

  const loadItems = () => {
    if (currentService?.metadata?.[currentConfig.itemKey]) {
      setItems(currentService.metadata[currentConfig.itemKey])
    } else {
      setItems([])
    }
  }

  const saveItems = async (updatedItems: any[]) => {
    if (!currentService) return
    try {
      const newMetadata = { ...currentService.metadata, [currentConfig.itemKey]: updatedItems }
      await apiClient.patch(`/providers/services/${currentService.id}`, { metadata: newMetadata })
      window.location.reload()
    } catch (e) {
      toast.error('Échec de l\'enregistrement')
    }
  }

  const openAddItem = () => {
    setItemForm({ ...currentConfig.defaultItem, id: '' })
    setShowItemDialog(true)
  }

  const saveItem = () => {
    const newItem = {
      id: itemForm.id || `${currentConfig.itemKey}-${Date.now()}`,
      ...Object.fromEntries(
        currentConfig.fields.map((field: string) => [
          field,
          field === 'price' || field === 'maxGuests' || field === 'available' || field === 'capacity' || field === 'groupSize'
            ? Number(itemForm[field]) || 0
            : field === 'amenities' || field === 'routes'
            ? itemForm[field].split(',').map((a: string) => a.trim()).filter(Boolean)
            : itemForm[field]
        ])
      )
    }

    const updated = itemForm.id
      ? items.map(i => i.id === itemForm.id ? newItem : i)
      : [...items, newItem]

    saveItems(updated)
    setShowItemDialog(false)
  }

  const editItem = (item: any) => {
    const formData: any = { id: item.id }
    currentConfig.fields.forEach((field: string) => {
      if (field === 'amenities' || field === 'routes') {
        formData[field] = item[field]?.join(', ') || ''
      } else {
        formData[field] = String(item[field] || '')
      }
    })
    setItemForm(formData)
    setShowItemDialog(true)
  }

  const deleteItem = (itemId: string) => {
    if (!confirm('Supprimer cet élément ?')) return
    const updated = items.filter(i => i.id !== itemId)
    saveItems(updated)
  }

  useEffect(() => {
    if (currentService) loadItems()
  }, [services, currentServiceType])

    const currentManagement = managementConfig[currentServiceType] || managementConfig.hotel
    const currentHotelService = services[0]

  const loadRooms = () => {
    if (currentHotelService?.metadata?.rooms) {
      setRooms(currentHotelService.metadata.rooms)
    }
  }

  const saveRooms = async (updatedRooms: any[]) => {
    if (!currentHotelService) return
    try {
      await apiClient.patch(`/providers/services/${currentHotelService.id}`, {
        metadata: { ...currentHotelService.metadata, rooms: updatedRooms }
      })
      // Refresh services
      window.location.reload()
    } catch (e) {
      toast.error('Failed to save rooms')
    }
  }

  const openAddRoom = () => {
    setRoomForm({ id: '', name: '', price: '', maxGuests: '2', available: '5', amenities: '' })
    setShowRoomDialog(true)
  }

  const saveRoom = () => {
    const newRoom = {
      id: roomForm.id || `room-${Date.now()}`,
      name: roomForm.name,
      price: Number(roomForm.price),
      currency: 'XAF',
      maxGuests: Number(roomForm.maxGuests),
      available: Number(roomForm.available),
      amenities: roomForm.amenities.split(',').map(a => a.trim()).filter(Boolean)
    }

    const updated = roomForm.id 
      ? rooms.map(r => r.id === roomForm.id ? newRoom : r)
      : [...rooms, newRoom]

    saveRooms(updated)
    setShowRoomDialog(false)
  }

  const editRoom = (room: any) => {
    setRoomForm({
      id: room.id,
      name: room.name,
      price: String(room.price),
      maxGuests: String(room.maxGuests),
      available: String(room.available),
      amenities: room.amenities?.join(', ') || ''
    })
    setShowRoomDialog(true)
  }

  const deleteRoom = (roomId: string) => {
    if (!confirm('Supprimer cette chambre ?')) return
    const updated = rooms.filter(r => r.id !== roomId)
    saveRooms(updated)
  }

  return (
    <div className="space-y-6">
      {!isVerified && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800 text-sm">
          Votre compte n’est pas encore vérifié. Vous ne pouvez pas publier de nouveaux services tant que la vérification n’est pas terminée.
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-slate-900">{config.title}</h1>
        <p className="text-slate-500 mt-1">{config.subtitle}</p>
        <p className="text-xs text-muted-foreground mt-1">
          Ces services vous appartiennent uniquement.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Offres de service</CardTitle>
          <Button 
            onClick={openCreate} 
            className="bg-[#44DBD4] hover:bg-[#3bc9c2]"
            disabled={!isVerified}
            title={!isVerified ? "Vérification requise pour ajouter des services" : ""}
          >
            <Plus className="h-4 w-4 mr-2" /> {config.addLabel}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Nom</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Lieu</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Prix</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Statut</th>
                  <th className="text-right py-3 px-4 font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && <tr><td colSpan={5} className="py-6 px-4 text-slate-500">Chargement…</td></tr>}
                {isError && <tr><td colSpan={5} className="py-6 px-4 text-red-600">Échec du chargement</td></tr>}
                {!isLoading && !isError && services.length === 0 && (
                  <tr><td colSpan={5} className="py-6 px-4 text-slate-500">Aucun service. Cliquez sur « {config.addLabel} » pour commencer.</td></tr>
                )}
                {services.map((s) => (
                  <tr key={s.id} className="border-b hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium">{s.name}</td>
                    <td className="py-3 px-4 text-sm text-slate-600">{s.location}, {s.country}</td>
                    <td className="py-3 px-4">{formatPrice(s.price, s.currency)}</td>
                    <td className="py-3 px-4">
                      <Badge className={s.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}>
                        {s.isActive ? 'Actif' : 'Désactivé'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(s)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" className="text-red-600" disabled={deleteMutation.isPending} onClick={() => { if (confirm('Désactiver ce service ?')) deleteMutation.mutate(s.id) }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Management Section for All Service Types */}
      {currentService && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{currentConfig.title}</CardTitle>
              <p className="text-sm text-slate-500 mt-1">Gérez vos offres spécifiques à ce type de service</p>
            </div>
            <Button onClick={openAddItem} className="bg-[#44DBD4] hover:bg-[#3bc9c2]" disabled={!isVerified}>
              <Plus className="h-4 w-4 mr-2" /> {currentConfig.addLabel}
            </Button>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                Aucun élément configuré. Ajoutez des {currentConfig.addLabel.toLowerCase()} pour les afficher publiquement.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-semibold">{item.name}</div>
                        {item.maxGuests && <div className="text-sm text-slate-600">{item.maxGuests} personnes max</div>}
                        {item.capacity && <div className="text-sm text-slate-600">Capacité : {item.capacity}</div>}
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatPrice(item.price, item.currency || 'XAF')}</div>
                        {item.available && <div className="text-xs text-green-600">{item.available} disponibles</div>}
                      </div>
                    </div>

                    {item.amenities?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.amenities.map((a: string, i: number) => (
                          <Badge key={i} variant="secondary" className="text-xs">{a}</Badge>
                        ))}
                      </div>
                    )}
                    {item.routes && <div className="text-sm text-slate-600 mt-1">Trajets : {item.routes}</div>}
                    {item.cuisine && <div className="text-sm text-slate-600 mt-1">Cuisine : {item.cuisine}</div>}

                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" onClick={() => editItem(item)}>
                        <Edit className="h-3 w-3 mr-1" /> Modifier
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600" onClick={() => deleteItem(item.id)}>
                        <Trash2 className="h-3 w-3 mr-1" /> Supprimer
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
                    {item.routes && <div className="text-sm text-slate-600 mt-1">Trajets : {item.routes}</div>}
                    {item.cuisine && <div className="text-sm text-slate-600 mt-1">Cuisine : {item.cuisine}</div>}

                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" onClick={() => editItem(item)}>
                        <Edit className="h-3 w-3 mr-1" /> Modifier
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600" onClick={() => deleteItem(item.id)}>
                        <Trash2 className="h-3 w-3 mr-1" /> Supprimer
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dynamic Item Dialog */}
      <Dialog open={showItemDialog} onOpenChange={setShowItemDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{itemForm.id ? 'Modifier' : 'Ajouter'} {currentConfig.addLabel.toLowerCase().replace('ajouter un ', '').replace('ajouter une ', '')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {currentConfig.fields.map((field: string) => (
              <div key={field}>
                <label className="text-sm font-medium capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
                <Input
                  type={['price', 'maxGuests', 'available', 'capacity', 'groupSize'].includes(field) ? 'number' : 'text'}
                  value={itemForm[field] || ''}
                  onChange={(e) => setItemForm({ ...itemForm, [field]: e.target.value })}
                  placeholder={field === 'amenities' || field === 'routes' ? 'Séparés par des virgules' : ''}
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowItemDialog(false)}>Annuler</Button>
            <Button onClick={saveItem} className="bg-[#44DBD4]">Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
