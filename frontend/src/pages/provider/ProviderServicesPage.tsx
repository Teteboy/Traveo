import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Edit, Edit2, Trash2, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
  metadata?: Record<string, any>
}

interface ServicesResponse { page: number; limit: number; total: number; items: ProviderService[] }

interface ServiceItem {
  id: string
  name: string
  price: number
  currency: string
  [key: string]: any
}

export function ProviderServicesPage() {
  const { currentServiceType, provider } = useProviderAuthStore()
  const isVerified = provider?.isVerified ?? false
  const qc = useQueryClient()

  // Use the provider's registered business type for better context
  const providerBusinessType = provider?.businessType?.toLowerCase() || currentServiceType

  const { data, isLoading, isError } = useQuery<ServicesResponse>({
    queryKey: ['provider-services'],
    queryFn: () => apiClient.get<ServicesResponse>('/providers/services?limit=100'),
  })

  const allServices = data?.items ?? []
  const services = allServices.filter(s => s.type.toLowerCase() === currentServiceType)

  // Fetch service sub-items from dedicated API
  const { data: itemsData, isLoading: itemsLoading } = useQuery<ServiceItem[]>({
    queryKey: ['provider-service-items', currentServiceType],
    queryFn: async () => {
      const endpointMap: Record<string, string> = {
        hotel: '/providers/service-items/hotel-rooms',
        restaurant: '/providers/service-items/menu-items',
        transport: '/providers/service-items/vehicles',
        guide: '/providers/service-items/tours',
        events: '/providers/service-items/event-spaces',
      }
      const endpoint = endpointMap[currentServiceType] || endpointMap.hotel
      const response = await apiClient.get<{ data: ServiceItem[] }>(endpoint)
      return response.data
    },
    enabled: true, // Always try to fetch, show error if no service exists
  })

  const items = itemsData ?? []

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/providers/services/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['provider-services'] })
      toast.success('Service désactivé')
    },
    onError: (err: unknown) => toast.error(err instanceof Error ? err.message : 'Échec de la suppression'),
  })

  // Service item mutations
  const createItemMutation = useMutation({
    mutationFn: (data: any) => {
      const endpointMap: Record<string, string> = {
        hotel: '/providers/service-items/hotel-rooms',
        restaurant: '/providers/service-items/menu-items',
        transport: '/providers/service-items/vehicles',
        guide: '/providers/service-items/tours',
        events: '/providers/service-items/event-spaces',
      }
      const endpoint = endpointMap[currentServiceType] || endpointMap.hotel
      return apiClient.post(endpoint, data)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['provider-service-items'] })
      setShowItemDialog(false)
      setItemForm({})
      toast.success('Élément ajouté')
    },
    onError: (err: unknown) => toast.error(err instanceof Error ? err.message : 'Échec de l\'ajout'),
  })

  const updateItemMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => {
      const endpointMap: Record<string, (id: string) => string> = {
        hotel: (id) => `/providers/service-items/hotel-rooms/${id}`,
        restaurant: (id) => `/providers/service-items/menu-items/${id}`,
        transport: (id) => `/providers/service-items/vehicles/${id}`,
        guide: (id) => `/providers/service-items/tours/${id}`,
        events: (id) => `/providers/service-items/event-spaces/${id}`,
      }
      const endpoint = endpointMap[currentServiceType]?.(id) || endpointMap.hotel(id)
      return apiClient.patch(endpoint, data)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['provider-service-items'] })
      setShowItemDialog(false)
      setItemForm({})
      toast.success('Élément mis à jour')
    },
    onError: (err: unknown) => toast.error(err instanceof Error ? err.message : 'Échec de la mise à jour'),
  })

  const deleteItemMutation = useMutation({
    mutationFn: (id: string) => {
      const endpointMap: Record<string, (id: string) => string> = {
        hotel: (id) => `/providers/service-items/hotel-rooms/${id}`,
        restaurant: (id) => `/providers/service-items/menu-items/${id}`,
        transport: (id) => `/providers/service-items/vehicles/${id}`,
        guide: (id) => `/providers/service-items/tours/${id}`,
        events: (id) => `/providers/service-items/event-spaces/${id}`,
      }
      const endpoint = endpointMap[currentServiceType]?.(id) || endpointMap.hotel(id)
      return apiClient.delete(endpoint)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['provider-service-items'] })
      toast.success('Élément supprimé')
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

  const config = getServiceTitle(providerBusinessType)

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
  const [showItemDialog, setShowItemDialog] = useState(false)
  const [itemForm, setItemForm] = useState<any>({})
  const [showServiceDialog, setShowServiceDialog] = useState(false)
  const [serviceForm, setServiceForm] = useState<any>({})

  const openAddItem = () => {
    setItemForm({ ...currentConfig.defaultItem, id: '', serviceId: services[0]?.id || '' })
    setShowItemDialog(true)
  }

  const saveItem = () => {
    const itemData: any = {
      name: itemForm.name,
      price: Number(itemForm.price) || 0,
      currency: 'XAF',
    }

    // Add serviceId if provided (for multi-service providers)
    if (itemForm.serviceId) {
      itemData.serviceId = itemForm.serviceId
    }

    // Add type-specific fields
    if (currentServiceType === 'hotel') {
      itemData.maxGuests = Number(itemForm.maxGuests) || 2
      itemData.available = Number(itemForm.available) || 1
      itemData.amenities = itemForm.amenities?.split(',').map((a: string) => a.trim()).filter(Boolean) || []
    } else if (currentServiceType === 'restaurant') {
      itemData.cuisine = itemForm.cuisine
      itemData.preparationTime = itemForm.preparationTime
    } else if (currentServiceType === 'transport') {
      itemData.capacity = Number(itemForm.capacity) || 4
      itemData.routes = itemForm.routes?.split(',').map((a: string) => a.trim()).filter(Boolean) || []
    } else if (currentServiceType === 'guide') {
      itemData.duration = itemForm.duration
      itemData.groupSize = Number(itemForm.groupSize) || 10
    } else if (currentServiceType === 'events') {
      itemData.capacity = Number(itemForm.capacity) || 50
      itemData.eventType = itemForm.eventType
    }

    if (itemForm.id) {
      updateItemMutation.mutate({ id: itemForm.id, data: itemData })
    } else {
      createItemMutation.mutate(itemData)
    }
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
    deleteItemMutation.mutate(itemId)
  }

  const editService = (service: any) => {
    setServiceForm({
      id: service.id,
      name: service.name,
      description: service.description,
      location: service.location,
      country: service.country,
      price: String(service.price),
      imageUrl: service.imageUrl || '',
    })
    setShowServiceDialog(true)
  }

  const openAddServiceDialog = () => {
    setServiceForm({
      id: '',
      name: '',
      description: '',
      location: '',
      country: 'Cameroun',
      price: '',
      imageUrl: '',
    })
    setShowServiceDialog(true)
  }

  const saveService = () => {
    const serviceData = {
      name: serviceForm.name,
      description: serviceForm.description,
      location: serviceForm.location,
      country: serviceForm.country,
      price: Number(serviceForm.price) || 0,
      currency: 'XAF',
      imageUrl: serviceForm.imageUrl,
      type: currentServiceType.toUpperCase(),
    }

    if (serviceForm.id) {
      // Update existing service
      apiClient.patch(`/providers/services/${serviceForm.id}`, serviceData)
        .then(() => {
          qc.invalidateQueries({ queryKey: ['provider-services'] })
          setShowServiceDialog(false)
          setServiceForm({})
          toast.success('Service mis à jour')
        })
        .catch((err) => toast.error(err instanceof Error ? err.message : 'Échec de la mise à jour'))
    } else {
      // Create new service
      apiClient.post('/providers/services', serviceData)
        .then(() => {
          qc.invalidateQueries({ queryKey: ['provider-services'] })
          setShowServiceDialog(false)
          setServiceForm({})
          toast.success('Service ajouté')
        })
        .catch((err) => toast.error(err instanceof Error ? err.message : 'Échec de l\'ajout'))
    }
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
          <Button onClick={openAddServiceDialog} className="bg-[#44DBD4] hover:bg-[#3bc9c2]" disabled={!isVerified}>
            <Plus className="h-4 w-4 mr-2" /> Ajouter un service
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
                        <Button variant="ghost" size="sm" onClick={() => editService(s)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
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
            {itemsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                Aucun élément configuré. Ajoutez des {currentConfig.addLabel.toLowerCase()} pour les afficher publiquement.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-semibold">{item.name}</div>
                        {item.maxGuests && <div className="text-sm text-slate-600">{item.maxGuests} personnes max</div>}
                        {item.capacity && <div className="text-sm text-slate-600">Capacité : {item.capacity}</div>}
                        {item.duration && <div className="text-sm text-slate-600">Durée : {item.duration}</div>}
                        {item.groupSize && <div className="text-sm text-slate-600">Groupe : {item.groupSize} pers.</div>}
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatPrice(item.price, item.currency || 'XAF')}</div>
                        {item.available !== undefined && <div className="text-xs text-green-600">{item.available} disponibles</div>}
                      </div>
                    </div>

                    {item.amenities?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.amenities.map((a: string, i: number) => (
                          <Badge key={i} variant="secondary" className="text-xs">{a}</Badge>
                        ))}
                      </div>
                    )}
                    {item.routes?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.routes.map((r: string, i: number) => (
                          <Badge key={i} variant="outline" className="text-xs">{r}</Badge>
                        ))}
                      </div>
                    )}
                    {item.cuisine && <div className="text-sm text-slate-600 mt-1">Cuisine : {item.cuisine}</div>}
                    {item.preparationTime && <div className="text-sm text-slate-600 mt-1">Préparation : {item.preparationTime}</div>}
                    {item.eventType && <div className="text-sm text-slate-600 mt-1">Type : {item.eventType}</div>}

                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" onClick={() => editItem(item)} disabled={updateItemMutation.isPending}>
                        <Edit className="h-3 w-3 mr-1" /> Modifier
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600" onClick={() => deleteItem(item.id)} disabled={deleteItemMutation.isPending}>
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

      {/* Dynamic Item Dialog */}
      <Dialog open={showItemDialog} onOpenChange={setShowItemDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{itemForm.id ? 'Modifier' : 'Ajouter'} {currentConfig.addLabel.toLowerCase().replace('ajouter un ', '').replace('ajouter une ', '')}</DialogTitle>
            <DialogDescription>
              {itemForm.id ? 'Modifiez les détails de cet élément.' : 'Ajoutez un nouvel élément à votre service.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {services.length > 1 && (
              <div>
                <label className="text-sm font-medium">Service</label>
                <Select
                  value={itemForm.serviceId || services[0]?.id}
                  onValueChange={(value) => setItemForm({ ...itemForm, serviceId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <label className="text-sm font-medium">Nom</label>
              <Input
                value={itemForm.name || ''}
                onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                placeholder="Nom de l'élément"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Prix (XAF)</label>
              <Input
                type="number"
                value={itemForm.price || ''}
                onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                placeholder="50000"
              />
            </div>
            {currentServiceType === 'hotel' && (
              <>
                {itemForm.serviceId && services.find(s => s.id === itemForm.serviceId)?.metadata?.roomTypes && (
                  <div>
                    <label className="text-sm font-medium">Type de chambre</label>
                    <Select
                      value={itemForm.roomType || ''}
                      onValueChange={(value) => {
                        const roomTypePricing: Record<string, number> = {
                          'Standard': 45000,
                          'Deluxe': 75000,
                          'Suite': 120000,
                          'Business': 85000,
                          'Superior': 65000,
                          'Junior Suite': 95000,
                          'Bungalow': 80000,
                          'Suite Ocean': 150000,
                        }
                        setItemForm({
                          ...itemForm,
                          roomType: value,
                          name: value,
                          price: String(roomTypePricing[value] || 50000),
                        })
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un type" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.find(s => s.id === itemForm.serviceId)?.metadata?.roomTypes?.map((rt: string) => (
                          <SelectItem key={rt} value={rt}>{rt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium">Capacité max (personnes)</label>
                  <Input
                    type="number"
                    value={itemForm.maxGuests || ''}
                    onChange={(e) => setItemForm({ ...itemForm, maxGuests: e.target.value })}
                    placeholder="2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Disponibles</label>
                  <Input
                    type="number"
                    value={itemForm.available || ''}
                    onChange={(e) => setItemForm({ ...itemForm, available: e.target.value })}
                    placeholder="5"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Équipements (séparés par des virgules)</label>
                  <Input
                    value={itemForm.amenities || ''}
                    onChange={(e) => setItemForm({ ...itemForm, amenities: e.target.value })}
                    placeholder="WiFi, Climatisation, TV"
                  />
                </div>
              </>
            )}
            {currentServiceType === 'restaurant' && (
              <>
                <div>
                  <label className="text-sm font-medium">Type de cuisine</label>
                  <Input
                    value={itemForm.cuisine || ''}
                    onChange={(e) => setItemForm({ ...itemForm, cuisine: e.target.value })}
                    placeholder="Africaine, Européenne, Asiatique"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Temps de préparation</label>
                  <Input
                    value={itemForm.preparationTime || ''}
                    onChange={(e) => setItemForm({ ...itemForm, preparationTime: e.target.value })}
                    placeholder="30 min"
                  />
                </div>
              </>
            )}
            {currentServiceType === 'transport' && (
              <>
                <div>
                  <label className="text-sm font-medium">Capacité (personnes)</label>
                  <Input
                    type="number"
                    value={itemForm.capacity || ''}
                    onChange={(e) => setItemForm({ ...itemForm, capacity: e.target.value })}
                    placeholder="4"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Trajets (séparés par des virgules)</label>
                  <Input
                    value={itemForm.routes || ''}
                    onChange={(e) => setItemForm({ ...itemForm, routes: e.target.value })}
                    placeholder="Douala-Yaoundé, Yaoundé-Bafoussam"
                  />
                </div>
              </>
            )}
            {currentServiceType === 'guide' && (
              <>
                <div>
                  <label className="text-sm font-medium">Durée</label>
                  <Input
                    value={itemForm.duration || ''}
                    onChange={(e) => setItemForm({ ...itemForm, duration: e.target.value })}
                    placeholder="2 jours, 1 nuit"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Taille du groupe</label>
                  <Input
                    type="number"
                    value={itemForm.groupSize || ''}
                    onChange={(e) => setItemForm({ ...itemForm, groupSize: e.target.value })}
                    placeholder="10"
                  />
                </div>
              </>
            )}
            {currentServiceType === 'events' && (
              <>
                <div>
                  <label className="text-sm font-medium">Capacité (personnes)</label>
                  <Input
                    type="number"
                    value={itemForm.capacity || ''}
                    onChange={(e) => setItemForm({ ...itemForm, capacity: e.target.value })}
                    placeholder="50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Type d'événement</label>
                  <Input
                    value={itemForm.eventType || ''}
                    onChange={(e) => setItemForm({ ...itemForm, eventType: e.target.value })}
                    placeholder="Mariage, Conférence, Soirée"
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowItemDialog(false)}>Annuler</Button>
            <Button onClick={saveItem} className="bg-[#44DBD4]" disabled={createItemMutation.isPending || updateItemMutation.isPending}>
              {createItemMutation.isPending || updateItemMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Service Dialog (Add/Edit) */}
      <Dialog open={showServiceDialog} onOpenChange={setShowServiceDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{serviceForm.id ? 'Modifier' : 'Ajouter'} un service</DialogTitle>
            <DialogDescription>
              {serviceForm.id ? 'Modifiez les informations de votre service.' : 'Créez un nouveau service pour votre entreprise.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Nom du service</label>
              <Input
                value={serviceForm.name || ''}
                onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                placeholder="Hôtel Hilton Yaoundé"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={serviceForm.description || ''}
                onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                placeholder="Description du service"
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Lieu</label>
              <Input
                value={serviceForm.location || ''}
                onChange={(e) => setServiceForm({ ...serviceForm, location: e.target.value })}
                placeholder="Avenue du 20 mai, Yaoundé"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Pays</label>
              <Input
                value={serviceForm.country || ''}
                onChange={(e) => setServiceForm({ ...serviceForm, country: e.target.value })}
                placeholder="Cameroun"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Prix (XAF)</label>
              <Input
                type="number"
                value={serviceForm.price || ''}
                onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                placeholder="95000"
              />
            </div>
            <div>
              <label className="text-sm font-medium">URL de l'image</label>
              <Input
                value={serviceForm.imageUrl || ''}
                onChange={(e) => setServiceForm({ ...serviceForm, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowServiceDialog(false)}>Annuler</Button>
            <Button onClick={saveService} className="bg-[#44DBD4]">
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
