import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { CatalogueState } from './types'
import { animeSamaService } from '../../services/animeSamaService'

/**
 * Store Zustand pour gérer le catalogue de mangas
 */
export const useCatalogueStore = create<CatalogueState>()(
  devtools(
    persist(
      (set) => ({
        // État initial
        catalogue: [],
        isLoading: false,
        error: null,

        // Actions
        getCatalogue: async () => {
          set({ isLoading: true, error: null })
          try {
            // Récupère les mangas depuis le fichier JSON avec les chapitres depuis l'API
            const catalogue = await animeSamaService.getAllMangasWithChapters()
            console.log('[CatalogueStore] Catalogue chargé:', catalogue.map(m => ({ title: m.title, image: m.image })))
            set({ catalogue, isLoading: false })
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Erreur inconnue',
              isLoading: false 
            })
          }
        },

      }),
      {
        name: 'catalogue-storage',
        partialize: (state) => ({ 
          catalogue: state.catalogue
        }),
        // Version 2 : Force le rechargement pour avoir les nouvelles images du JSON
        version: 2,
        migrate: (persistedState: any, version: number) => {
          // Si on migre depuis une version antérieure, on vide le catalogue pour forcer le rechargement
          if (version < 2) {
            console.log('[CatalogueStore] Migration: vidage du cache pour recharger les images')
            return { catalogue: [], isLoading: false, error: null }
          }
          return persistedState
        },
      }
    )
  )
)

