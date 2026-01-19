import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { CurrentMangaState, ReadingManga } from './types'
import type { Manga } from '../catalogueStore/types'

export const useCurrentMangaStore = create<CurrentMangaState>()(
  devtools(
    persist(
      (set, get) => ({
        readingList: [],

        addToReadingList: (manga: Manga, chapter: number) => {
          const { readingList } = get()
          const existingIndex = readingList.findIndex(m => m.id === manga.id)

          if (existingIndex !== -1) {
            // Met à jour le manga existant
            const updatedList = [...readingList]
            updatedList[existingIndex] = {
              ...manga,
              highestChapter: Math.max(chapter, updatedList[existingIndex].highestChapter),
              lastReadAt: new Date().toISOString()
            }
            set({ readingList: updatedList })
          } else {
            // Ajoute un nouveau manga
            const newManga: ReadingManga = {
              ...manga,
              highestChapter: chapter,
              lastReadAt: new Date().toISOString()
            }
            set({ readingList: [newManga, ...readingList] })
          }
        },

        updateChapter: (mangaId: number, chapter: number) => {
          const { readingList } = get()
          const mangaIndex = readingList.findIndex(m => m.id === mangaId)

          if (mangaIndex !== -1) {
            const updatedList = [...readingList]
            const currentManga = updatedList[mangaIndex]
            
            // Met à jour uniquement si le nouveau chapitre est plus élevé
            if (chapter > currentManga.highestChapter) {
              updatedList[mangaIndex] = {
                ...currentManga,
                highestChapter: chapter,
                lastReadAt: new Date().toISOString()
              }
              set({ readingList: updatedList })
            } else {
              // Met à jour juste la date
              updatedList[mangaIndex] = {
                ...currentManga,
                lastReadAt: new Date().toISOString()
              }
              set({ readingList: updatedList })
            }
          }
        },

        removeFromReadingList: (mangaId: number) => {
          set((state) => ({
            readingList: state.readingList.filter(m => m.id !== mangaId)
          }))
        },

        isInReadingList: (mangaId: number) => {
          const { readingList } = get()
          return readingList.some(m => m.id === mangaId)
        },

        getMangaProgress: (mangaId: number) => {
          const { readingList } = get()
          return readingList.find(m => m.id === mangaId)
        },

        clearReadingList: () => {
          set({ readingList: [] })
        },
      }),
      {
        name: 'reading-list-storage',
        partialize: (state) => ({ 
          readingList: state.readingList 
        }),
      }
    )
  )
)

