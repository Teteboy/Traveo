import { useState, useEffect } from 'react'
import { Upload, FileText, Download, Trash2, Eye, FileImage, File, Loader2, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { apiClient, uploadFile } from '@/lib/apiClient'
import { useCurrentUser } from '@/hooks/useAuth'
import { useAuthStore } from '@/stores/authStore'

interface DocItem {
  id: string
  name: string
  type: string
  size: string
  uploadDate: string
  category: string
  fileUrl?: string
  source: 'general' | 'visa'
}

const categoryLabels: Record<string, string> = {
  passport: 'Passeport',
  visa: 'Visa',
  ticket: 'Billet',
  insurance: 'Assurance',
  other: 'Autre',
  photo: 'Photo',
  proof_of_funds: 'Justificatif de fonds',
  invitation_letter: "Lettre d'invitation",
  vaccination_cert: 'Certificat de vaccination',
  hotel_reservation: 'Réservation d\'hôtel',
  flight_itinerary: 'Itinéraire de vol',
  letter_of_employment: "Lettre d'emploi",
}

const categoryColors: Record<string, string> = {
  passport: 'bg-blue-100 text-blue-700',
  visa: 'bg-green-100 text-green-700',
  ticket: 'bg-purple-100 text-purple-700',
  insurance: 'bg-orange-100 text-orange-700',
  other: 'bg-gray-100 text-gray-700'
}

export function DocumentStorage() {
  const user = useCurrentUser()
  const { isAuthenticated } = useAuthStore()
  const [documents, setDocuments] = useState<DocItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [documentCategory, setDocumentCategory] = useState<string>('other')
  const [showPreview, setShowPreview] = useState(false)
  const [previewDocument, setPreviewDocument] = useState<DocItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)

  // Fetch documents on mount and category change
  useEffect(() => {
    if (!user || !isAuthenticated) return
    fetchDocuments()
  }, [user, isAuthenticated, selectedCategory])

  // Fetch stats on mount
  useEffect(() => {
    if (!user || !isAuthenticated) return
    fetchStats()
  }, [user, isAuthenticated])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      // Fetch BOTH general documents and visa-specific documents concurrently
      const [generalRes, visaRes] = await Promise.all([
        apiClient.get<{ items: DocItem[]; total: number; page: number; limit: number }>(`/documents?category=${selectedCategory}`),
        apiClient.get<{ items: DocItem[]; total: number; page: number; limit: number }>(`/visa/documents`).catch(() => ({ items: [] as DocItem[], total: 0, page: 1, limit: 20 })),
      ])

      // Merge general ('general') and visa ('visa') docs, de-duplicate by id
      const general = (generalRes.items || []).map(d => ({ ...d, source: 'general' as const }))
      const visa = (visaRes.items || []).map(d => ({ ...d, source: 'visa' as const }))
      const byId = new Map<string, DocItem>()
      for (const doc of [...general, ...visa]) byId.set(doc.id, doc)
      setDocuments(Array.from(byId.values()).sort((a, b) => b.uploadDate.localeCompare(a.uploadDate)))
    } catch (error: any) {
      console.error('Failed to fetch documents:', error)
      if (error.message?.includes('Session expirée')) {
        setDocuments([])
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await apiClient.get<{
        totalFiles: number;
        totalSize: number;
        totalSizeFormatted: string;
        usagePercentage: number;
      }>('/documents/stats')
      setStats(response)
    } catch (error: any) {
      console.error('Failed to fetch stats:', error)
      if (error.message?.includes('Session expirée')) {
        setStats(null)
      }
    }
  }

  const filteredDocuments = documents.filter(doc =>
    selectedCategory === 'all' || doc.category === selectedCategory
  )

  const getFileIcon = (type: string) => {
    if (type.includes('image') || type === 'JPG' || type === 'PNG') {
      return <FileImage className="h-8 w-8 text-blue-500" />
    }
    return <FileText className="h-8 w-8 text-red-500" />
  }

  const handleFileSelect = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        setSelectedFile(file)
      }
    }
    input.click()
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('category', documentCategory)

      // Simulate upload progress
      for (let i = 0; i <= 90; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100))
        setUploadProgress(i)
      }

      const uploadResponse = await uploadFile('/documents', formData) as { data: { document: DocItem } }

      setUploadProgress(100)
      const uploadedDoc: DocItem = { ...uploadResponse.data.document, source: 'general' }
      setDocuments(prev => [uploadedDoc, ...prev])
      fetchStats() // Refresh stats

      setIsUploading(false)
      setShowUploadDialog(false)
      setSelectedFile(null)
      setUploadProgress(0)
    } catch (error) {
      console.error('Upload failed:', error)
      setIsUploading(false)
      setUploadProgress(0)
      alert('Erreur lors du téléchargement. Veuillez réessayer.')
    }
  }

  const handleDelete = async (id: string, source: DocItem['source']) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) return

    try {
      if (source === 'visa') {
        // Visa docs cannot be deleted via this generic endpoint; they are managed per-application
        alert('Ce document ne peut pas être supprimé depuis cet onglet. Il est lié à une demande de visa.')
        return
      }
      await apiClient.delete(`/documents/${id}`)
      setDocuments(prev => prev.filter(doc => doc.id !== id))
      fetchStats() // Refresh stats
    } catch (error) {
      console.error('Delete failed:', error)
      alert('Erreur lors de la suppression. Veuillez réessayer.')
    }
  }

  const handleDownload = (doc: DocItem) => {
    if (doc.fileUrl) {
      window.open(doc.fileUrl, '_blank')
    } else {
      alert('URL du fichier non disponible')
    }
  }

  const handleView = (doc: DocItem) => {
    setPreviewDocument(doc)
    setShowPreview(true)
  }

  // Show login prompt if not authenticated
  if (!user || !isAuthenticated) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <File className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Veuillez vous connecter pour accéder à vos documents</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Mes Documents de Voyage
            </CardTitle>
            <Button onClick={() => setShowUploadDialog(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </div>
          
          {/* Category Filter */}
          <div className="flex gap-2 mt-4 flex-wrap">
            <Badge
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSelectedCategory('all')}
            >
              Tous
            </Badge>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <Badge
                key={key}
                variant={selectedCategory === key ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(key)}
              >
                {label}
              </Badge>
            ))}
          </div>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Chargement...</span>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <File className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucun document trouvé</p>
              <Button variant="outline" className="mt-4" onClick={() => setShowUploadDialog(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Ajouter un document
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  {/* File Icon */}
                  <div className="flex-shrink-0">
                    {getFileIcon(doc.type)}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                     <div className="flex items-center gap-2">
                       <p className="font-medium truncate">{doc.name}</p>
                     </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{doc.type}</span>
                      <span>•</span>
                      <span>{doc.size}</span>
                      <span>•</span>
                      <span>{doc.uploadDate}</span>
                    </div>
                  </div>

                   {/* Category Badge */}
                   <Badge className={cn("hidden sm:flex", categoryColors[doc.category] ?? 'bg-gray-100 text-gray-700')}>
                     {categoryLabels[doc.category] ?? doc.category}
                   </Badge>



                   {/* Actions */}
                   <div className="flex items-center gap-1">
                     <Button 
                       variant="ghost" 
                       size="icon" 
                       className="h-8 w-8"
                       onClick={() => handleView(doc)}
                     >
                       <Eye className="h-4 w-4" />
                     </Button>
                     <Button 
                       variant="ghost" 
                       size="icon" 
                       className="h-8 w-8"
                       onClick={() => handleDownload(doc)}
                     >
                       <Download className="h-4 w-4" />
                     </Button>
                     {doc.source === 'general' && (
                       <Button
                         variant="ghost"
                         size="icon"
                         className="h-8 w-8 text-destructive hover:text-destructive"
                         onClick={() => handleDelete(doc.id, doc.source)}
                       >
                         <Trash2 className="h-4 w-4" />
                       </Button>
                     )}
                   </div>
                </div>
              ))}
            </div>
          )}

          {/* Storage Info */}
          {stats && (
            <div className="mt-6 pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Stockage utilisé</span>
                <span className="font-medium">{stats.totalSizeFormatted} / 50 MB</span>
              </div>
              <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${stats.usagePercentage}%` }} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter un document</DialogTitle>
            <DialogDescription>
              Téléchargez vos documents de voyage
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Category Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Catégorie</label>
              <select
                className="w-full border rounded-md px-3 py-2"
                value={documentCategory}
                onChange={(e) => setDocumentCategory(e.target.value)}
              >
                <option value="passport">Passeport</option>
                <option value="visa">Visa</option>
                <option value="ticket">Billet</option>
                <option value="insurance">Assurance</option>
                <option value="other">Autre</option>
              </select>
            </div>

            {/* File Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Fichier</label>
              <div 
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={handleFileSelect}
              >
                {selectedFile ? (
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="font-medium">{selectedFile.name}</span>
                  </div>
                ) : (
                  <>
                    <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Cliquez pour sélectionner un fichier
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF, JPG, PNG, DOC (max 10MB)
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Téléchargement en cours...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => {
              setShowUploadDialog(false)
              setSelectedFile(null)
            }}>
              Annuler
            </Button>
            <Button 
              className="flex-1" 
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? (
                <Upload className="h-4 w-4 mr-2 animate-pulse" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Télécharger
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{previewDocument?.name}</DialogTitle>
            <DialogDescription>
              Aperçu du document
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {previewDocument && (
              <div className="space-y-4">
                <div className="bg-muted rounded-lg p-8 flex items-center justify-center">
                  {getFileIcon(previewDocument.type)}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <span className="ml-2 font-medium">{previewDocument.type}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Taille:</span>
                    <span className="ml-2 font-medium">{previewDocument.size}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Date:</span>
                    <span className="ml-2 font-medium">{previewDocument.uploadDate}</span>
                  </div>

                </div>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowPreview(false)}>
              Fermer
            </Button>
            <Button className="flex-1" onClick={() => {
              if (previewDocument) handleDownload(previewDocument)
            }}>
              <Download className="h-4 w-4 mr-2" />
              Télécharger
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
