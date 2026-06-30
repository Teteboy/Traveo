import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FileText, Check, X, Loader2, Search, Clock, CheckCircle, XCircle, ExternalLink, Building2 } from 'lucide-react'
import { apiClient } from '@/lib/apiClient'

type ProviderDocument = {
  id: string
  documentType: string
  fileUrl: string
  fileName: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  uploadedAt: string
  reviewedAt: string | null
  reviewNote: string | null
  providerName: string
  providerEmail: string
}

type PaginatedResponse<T> = {
  page: number
  limit: number
  total: number
  items: T[]
}

export function AdminDocumentsPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [search, setSearch] = useState('')
  const [selectedDocument, setSelectedDocument] = useState<ProviderDocument | null>(null)
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [reviewAction, setReviewAction] = useState<'APPROVED' | 'REJECTED' | null>(null)
  const [reviewNote, setReviewNote] = useState('')

  const { data, isLoading, error } = useQuery<PaginatedResponse<ProviderDocument>>({
    queryKey: ['admin-documents', page, statusFilter, search],
    queryFn: () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(search && { search }),
      })
      return apiClient.get(`/admin/provider-documents?${params}`)
    },
    staleTime: 30000,
  })

  const reviewMutation = useMutation({
    mutationFn: ({ id, status, reviewNote }: { id: string; status: string; reviewNote?: string }) =>
      apiClient.patch(`/admin/provider-documents/${id}`, { status, reviewNote }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-documents'] })
      setShowReviewDialog(false)
      setSelectedDocument(null)
      setReviewNote('')
      setReviewAction(null)
    },
  })

  const documents = data?.items || []
  const total = data?.total || 0
  const totalPages = Math.ceil(total / limit)

  const handleReviewDocument = (document: ProviderDocument, action: 'APPROVED' | 'REJECTED') => {
    setSelectedDocument(document)
    setReviewAction(action)
    setShowReviewDialog(true)
  }

  const handleSubmitReview = () => {
    if (!selectedDocument || !reviewAction) return
    reviewMutation.mutate({
      id: selectedDocument.id,
      status: reviewAction,
      reviewNote: reviewNote || undefined,
    })
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      APPROVED: 'bg-green-100 text-green-700',
      REJECTED: 'bg-red-100 text-red-700',
    }
    const labels: Record<string, string> = {
      PENDING: 'En attente',
      APPROVED: 'Approuvé',
      REJECTED: 'Rejeté',
    }
    const icons: Record<string, any> = {
      PENDING: Clock,
      APPROVED: CheckCircle,
      REJECTED: XCircle,
    }
    const Icon = icons[status] || Clock
    return { style: styles[status] || 'bg-slate-100 text-slate-700', label: labels[status] || status, Icon }
  }

  const getDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      id_card: 'Pièce d\'identité',
      business_license: 'Licence commerciale',
      insurance: 'Attestation d\'assurance',
      tax_certificate: 'Attestation fiscale',
      other: 'Autre',
    }
    return labels[type] || type
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Documents de Vérification</h1>
          <p className="text-muted-foreground mt-1">
            Révisez les documents de vérification des prestataires
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <FileText className="h-3 w-3" />
            {total} documents
          </Badge>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom d'entreprise, email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="approved">Approuvés</SelectItem>
                <SelectItem value="rejected">Rejetés</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Documents des Prestataires</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">
              Erreur lors du chargement des documents
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Aucun document trouvé
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Prestataire</TableHead>
                    <TableHead>Type de document</TableHead>
                    <TableHead>Fichier</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((document) => {
                    const { style, label, Icon } = getStatusBadge(document.status)
                    return (
                      <TableRow key={document.id}>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(document.uploadedAt).toLocaleDateString('fr-FR')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{document.providerName}</div>
                            <div className="text-sm text-muted-foreground">{document.providerEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{getDocumentTypeLabel(document.documentType)}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-slate-400" />
                            <span className="text-sm truncate max-w-[200px]">{document.fileName}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => window.open(document.fileUrl, '_blank')}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={style}>
                            <Icon className="h-3 w-3 mr-1" />
                            {label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {document.status === 'PENDING' && (
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleReviewDocument(document, 'APPROVED')}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Approuver
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => handleReviewDocument(document, 'REJECTED')}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                          {document.status === 'APPROVED' && (
                            <span className="text-sm text-green-600">Approuvé le {document.reviewedAt ? new Date(document.reviewedAt).toLocaleDateString('fr-FR') : '-'}</span>
                          )}
                          {document.status === 'REJECTED' && (
                            <div className="text-sm">
                              <span className="text-red-600">Rejeté</span>
                              {document.reviewNote && (
                                <div className="text-muted-foreground text-xs mt-1">{document.reviewNote}</div>
                              )}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {page} sur {totalPages} ({total} résultats)
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => setPage(p => p - 1)}
                    >
                      Précédent
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === totalPages}
                      onClick={() => setPage(p => p + 1)}
                    >
                      Suivant
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'APPROVED' ? 'Approuver le document' : 'Rejeter le document'}
            </DialogTitle>
            <DialogDescription>
              {selectedDocument && (
                <span>
                  {getDocumentTypeLabel(selectedDocument.documentType)} de {selectedDocument.providerName}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedDocument && (
              <div className="bg-slate-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-4 w-4 text-slate-600" />
                  <span className="font-medium">{selectedDocument.providerName}</span>
                </div>
                <div className="text-sm text-slate-600">
                  <a href={selectedDocument.fileUrl} target="_blank" rel="noopener noreferrer" className="text-[#44DBD4] hover:underline">
                    {selectedDocument.fileName}
                  </a>
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium">Note de révision (optionnel)</label>
              <Textarea
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder="Ajoutez une note pour expliquer votre décision..."
                rows={3}
                className="mt-2"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleSubmitReview}
              disabled={reviewMutation.isPending}
              className={reviewAction === 'REJECTED' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
            >
              {reviewMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : reviewAction === 'APPROVED' ? (
                'Approuver'
              ) : (
                'Rejeter'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
