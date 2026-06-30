import { create } from 'zustand'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: string
  actionUrl?: string
}

interface NotificationState {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  getUnreadCount: () => number
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [
    {
      id: '1',
      title: 'Vol confirmé',
      message: 'Votre vol AF 1234 vers Dakar est confirmé',
      type: 'success',
      read: false,
      createdAt: new Date().toISOString(),
      actionUrl: '/my-trips',
    },
    {
      id: '2',
      title: 'Visa approuvé',
      message: 'Votre demande de visa pour le Sénégal a été approuvée',
      type: 'success',
      read: false,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      actionUrl: '/visa',
    },
  ],
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        {
          ...notification,
          id: `NOTIF_${Date.now()}`,
          createdAt: new Date().toISOString(),
        },
        ...state.notifications,
      ],
    })),
  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),
  getUnreadCount: () => {
    return get().notifications.filter((n) => !n.read).length
  },
}))
