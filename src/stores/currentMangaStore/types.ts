import type { Manga } from '../catalogueStore/types'

export interface ReadingManga extends Manga {
  highestChapter: number
  lastReadAt: string
}

export interface CurrentMangaState {
  readingList: ReadingManga[]
  addToReadingList: (manga: Manga, chapter: number) => void
  updateChapter: (mangaId: number, chapter: number) => void
  removeFromReadingList: (mangaId: number) => void
  isInReadingList: (mangaId: number) => boolean
  getMangaProgress: (mangaId: number) => ReadingManga | undefined
  clearReadingList: () => void
}

