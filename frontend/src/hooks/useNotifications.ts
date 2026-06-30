import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'
import type { NotificationsResponse, NotificationItem } from '@/api/api'

export function useNotifications(params: { page?: number; limit?: number; type?: string; read?: boolean } = {}) {
  const qs = new URLSearchParams(
    Object.fromEntries(
      Object.entries({ page: 1, limit: 20, ...params })
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)])
    )
  ).toString()

  return useQuery<NotificationsResponse>({
    queryKey: ['notifications', params],
    queryFn: () => apiClient.get<NotificationsResponse>(`/notifications?${qs}`),
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 2 * 60 * 1000, // poll every 2 minutes
  })
}

export function useMarkNotificationRead() {
  const qc = useQueryClient()
  return useMutation<{ data: NotificationItem }, Error, string>({
    mutationFn: (id) => apiClient.patch<{ data: NotificationItem }>(`/notifications/${id}/read`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notifications'] }) },
  })
}

export function useMarkAllRead() {
  const qc = useQueryClient()
  return useMutation<unknown, Error, void>({
    mutationFn: () => apiClient.patch('/notifications/read-all'),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notifications'] }) },
  })
}

export function useDeleteNotification() {
  const qc = useQueryClient()
  return useMutation<unknown, Error, string>({
    mutationFn: (id) => apiClient.delete(`/notifications/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notifications'] }) },
  })
}

export function useUnreadCount() {
  const { data } = useNotifications({ read: false, limit: 1 })
  return data?.total ?? 0
}
