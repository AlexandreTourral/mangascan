import type { Manga } from '../catalogueStore/types'

export interface CollectionState {
  collection: Manga[]
  addToCollection: (manga: Manga) => void
  removeFromCollection: (mangaId: number) => void
  isInCollection: (mangaId: number) => boolean
  clearCollection: () => void
}

