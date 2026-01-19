import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { CollectionState } from './types'

export const useCollectionStore = create<CollectionState>()(
  devtools(
    persist(
      (set, get) => ({
        collection: [],

        addToCollection: (manga) => {
          const { collection } = get()
          const exists = collection.some(m => m.id === manga.id)
          if (!exists) {
            set({ collection: [...collection, manga] })
          }
        },

        removeFromCollection: (mangaId) => {
          set((state) => ({
            collection: state.collection.filter(m => m.id !== mangaId)
          }))
        },

        isInCollection: (mangaId) => {
          const { collection } = get()
          return collection.some(m => m.id === mangaId)
        },

        clearCollection: () => {
          set({ collection: [] })
        },
      }),
      {
        name: 'collection-storage',
        partialize: (state) => ({ 
          collection: state.collection 
        }),
      }
    )
  )
)

