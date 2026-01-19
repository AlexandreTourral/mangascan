import type { Manga } from '../stores/catalogueStore/types'
import mangasData from '../data/mangas.json'

interface MangaData {
  id: number
  name: string
  url: string
  image: string
}

interface AnimeSamaChaptersResponse {
  [chapterNumber: string]: number
}

export const animeSamaService = {
  getMangasFromJson(): MangaData[] {
    return mangasData.mangas
  },

  // Ajuste l'AFFICHAGE du numéro de chapitre pour One Piece (décalage de -1 à partir du chapitre 1046)
  // Ne change pas le chargement, seulement ce qui est affiché dans l'UI
  getDisplayChapterNumber(mangaName: string, chapterNumber: number): number {
    if (mangaName.toLowerCase() === 'one piece' && chapterNumber >= 1046) {
      return chapterNumber - 1
    }
    return chapterNumber
  },

  async fetchChaptersCount(url: string): Promise<number> {
    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`)
      const data: AnimeSamaChaptersResponse = await response.json()
      
      // Filtre uniquement les clés qui sont des numéros de chapitres valides (>= 1)
      const validChapters = Object.keys(data).filter(key => {
        const num = parseInt(key)
        return !isNaN(num) && num >= 1
      })
      
      console.log(`Nombre de chapitres valides: ${validChapters.length}`)
      return validChapters.length
    } catch (error) {
      console.error('Erreur lors de la récupération des chapitres:', error)
      return 0
    }
  },

  async getChapterDetails(url: string, chapterNumber: number): Promise<number> {
    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`)
      const data: AnimeSamaChaptersResponse = await response.json()
      return data[chapterNumber.toString()] || 0
    } catch (error) {
      console.error(`Erreur chapitre ${chapterNumber}:`, error)
      return 0
    }
  },

  async convertToManga(mangaData: MangaData): Promise<Manga> {
    const chapters = await this.fetchChaptersCount(mangaData.url)
    const manga = {
      id: mangaData.id,
      title: mangaData.name,
      image: mangaData.image,
      chapters,
    }
    console.log(`[animeSamaService] Manga créé: ${manga.title}, Image: ${manga.image}`)
    return manga
  },

  async getAllMangasWithChapters(): Promise<Manga[]> {
    const mangasData = this.getMangasFromJson()
    const mangasPromises = mangasData.map(data => this.convertToManga(data))
    try {
      return await Promise.all(mangasPromises)
    } catch (error) {
      console.error('Erreur récupération mangas:', error)
      return []
    }
  },

  searchMangaByName(name: string): MangaData | undefined {
    const mangas = this.getMangasFromJson()
    return mangas.find(manga => 
      manga.name.toLowerCase().includes(name.toLowerCase())
    )
  },

  getPageUrl(mangaName: string, chapter: number, page: number): string {
    const formattedName = encodeURIComponent(mangaName)
    return `/api/anime-sama/${formattedName}/${chapter}/${page}.jpg`
  },

  async getChapterPages(url: string, mangaName: string, chapterNumber: number): Promise<string[]> {
    const pageCount = await this.getChapterDetails(url, chapterNumber)
    if (pageCount === 0) return []
    return Array.from({ length: pageCount }, (_, i) => 
      this.getPageUrl(mangaName, chapterNumber, i + 1)
    )
  }
}

