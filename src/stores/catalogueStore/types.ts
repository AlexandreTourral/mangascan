/**
 * Types pour le catalogue de mangas
 */

export interface Manga {
  id: number
  title: string
  image: string
  chapters?: number
  description?: string
  lastChapterRead?: number
  createdAt?: string
  updatedAt?: string
}

export interface CatalogueState {
  // Données
  catalogue: Manga[]
  
  // États UI
  isLoading: boolean
  error: string | null
  
  // Actions
  getCatalogue: () => Promise<void>
}

