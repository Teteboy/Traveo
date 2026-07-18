import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { WalletTransaction } from '@/types/schema'

interface WalletBalance {
  currency: string
  amount: number
}

interface WalletState {
  balances: WalletBalance[]
  transactions: WalletTransaction[]
  addTransaction: (transaction: WalletTransaction) => void
  getBalance: (currency: string) => number
  updateBalance: (currency: string, amount: number) => void
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      balances: [
        { currency: 'XAF', amount: 150000 },
      ],
      transactions: [
        {
          id: 'TRX001',
          userId: '1',
          type: 'credit',
          amount: 50000,
          currency: 'XAF',
          description: 'Rechargement de compte',
          status: 'completed',
          createdAt: new Date().toISOString(),
        },
      ],
      addTransaction: (transaction) =>
        set((state) => ({
          transactions: [transaction, ...state.transactions],
        })),
      getBalance: (currency) => {
        const balance = get().balances.find((b) => b.currency === currency)
        return balance?.amount || 0
      },
      updateBalance: (currency, amount) =>
        set((state) => ({
          balances: state.balances.map((b) =>
            b.currency === currency ? { ...b, amount } : b
          ),
        })),
    }),
    {
      name: 'wallet-storage',
    }
  )
)
