import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'
import type {
  VisaDestination,
  VisaEligibilityResponse,
  VisaApplication,
  VisaCreateRequest,
  VisaCreateResponse,
} from '@/api/api'

interface VisaApplicationsResponse {
  page: number
  limit: number
  total: number
  items: VisaApplication[]
}

export function useVisaDestinations() {
  return useQuery<{ data: VisaDestination[] }>({
    queryKey: ['visa', 'destinations'],
    queryFn: () => apiClient.get<{ data: VisaDestination[] }>('/visa/destinations'),
    staleTime: 30 * 60 * 1000,
  })
}

export function useVisaRequirements(countryCode: string) {
  return useQuery<{ data: VisaEligibilityResponse }>({
    queryKey: ['visa', 'requirements', countryCode],
    queryFn: () => apiClient.get<{ data: VisaEligibilityResponse }>(`/visa/${countryCode}/requirements`),
    enabled: !!countryCode,
    staleTime: 30 * 60 * 1000,
  })
}

export function useVisaApplications(params: { page?: number; limit?: number } = {}) {
  const qs = new URLSearchParams({ page: String(params.page ?? 1), limit: String(params.limit ?? 20) }).toString()
  return useQuery<VisaApplicationsResponse>({
    queryKey: ['visa', 'applications', params],
    queryFn: () => apiClient.get<VisaApplicationsResponse>(`/visa/applications?${qs}`),
    staleTime: 2 * 60 * 1000,
  })
}

export function useVisaApplication(id: string) {
  return useQuery<{ data: VisaApplication & { documents: unknown[] } }>({
    queryKey: ['visa', 'application', id],
    queryFn: () => apiClient.get(`/visa/applications/${id}`),
    enabled: !!id,
  })
}

export function useCreateVisaApplication() {
  const qc = useQueryClient()
  return useMutation<VisaCreateResponse, Error, VisaCreateRequest>({
    mutationFn: (data) => apiClient.post<VisaCreateResponse>('/visa/applications', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['visa', 'applications'] }) },
  })
}
