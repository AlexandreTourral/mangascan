import { useParams, useNavigate } from "react-router-dom"
import { useCatalogueStore } from "../stores/catalogueStore"
import { useCurrentMangaStore } from "../stores/currentMangaStore"
import { useState, useEffect } from "react"
import { animeSamaService } from "../services/animeSamaService"
import Button from "../components/Button"

export default function ChapterPage() {
  const { id, chapter } = useParams()
  const navigate = useNavigate()
  const { catalogue } = useCatalogueStore()
  const { addToReadingList, updateChapter, getMangaProgress } = useCurrentMangaStore()

  const manga = catalogue.find((manga) => manga.id === parseInt(id as string))
  const chapterNumber = parseInt(chapter as string)
  const [pages, setPages] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  // Numéro de chapitre à afficher dans l'UI (décalé pour One Piece)
  const displayChapterNumber = manga 
    ? animeSamaService.getDisplayChapterNumber(manga.title, chapterNumber)
    : chapterNumber

  // Récupère les pages du chapitre
  useEffect(() => {
    if (!manga) return

    const fetchPages = async () => {
      setLoading(true)
      try {
        const mangaData = animeSamaService.searchMangaByName(manga.title)
        if (mangaData) {
          const chapterPages = await animeSamaService.getChapterPages(
            mangaData.url,
            mangaData.name,
            chapterNumber
          )
          setPages(chapterPages)
        }
      } catch (error) {
        console.error('Erreur lors du chargement des pages:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPages()
  }, [manga, chapterNumber])

  // Met à jour la reading list
  useEffect(() => {
    if (manga) {
      const progress = getMangaProgress(manga.id)
      if (progress) {
        // Met à jour le chapitre si le manga est déjà dans la reading list
        updateChapter(manga.id, chapterNumber)
      } else {
        // Ajoute le manga à la reading list
        addToReadingList(manga, chapterNumber)
      }
    }
  }, [manga, chapterNumber, addToReadingList, updateChapter, getMangaProgress])

  if (!manga) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl" style={{ color: 'var(--color-royal-blue)' }}>
          Manga non trouvé
        </div>
      </div>
    )
  }

  const hasPreviousChapter = chapterNumber > 1
  const hasNextChapter = chapterNumber < (manga.chapters || 0)

  const goToPreviousChapter = () => {
    if (hasPreviousChapter) {
      navigate(`/manga/${id}/chapter/${chapterNumber - 1}`)
    }
  }

  const goToNextChapter = () => {
    if (hasNextChapter) {
      navigate(`/manga/${id}/chapter/${chapterNumber + 1}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec titre et navigation */}
      <div className="sticky top-0 z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Bouton retour */}
          <div className="mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/manga/${id}`)}
              leftIcon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M11.03 3.97a.75.75 0 0 1 0 1.06l-6.22 6.22H21a.75.75 0 0 1 0 1.5H4.81l6.22 6.22a.75.75 0 1 1-1.06 1.06l-7.5-7.5a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
                </svg>
              }
            >
              Retour au manga
            </Button>
          </div>

          <div className="flex items-center justify-between">
            {/* Bouton chapitre précédent */}
            <Button
              variant={hasPreviousChapter ? 'outline' : 'ghost'}
              size="md"
              onClick={goToPreviousChapter}
              disabled={!hasPreviousChapter}
              leftIcon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 1 1 1.06 1.06L9.31 12l6.97 6.97a.75.75 0 1 1-1.06 1.06l-7.5-7.5Z" clipRule="evenodd" />
                </svg>
              }
            >
              Précédent
            </Button>

            {/* Titre */}
            <div className="flex-1 text-center px-4">
              <h1 className="text-2xl font-bold" style={{ color: 'var(--color-royal-blue-darker)' }}>
                {manga.title}
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--color-royal-blue)' }}>
                Chapitre {displayChapterNumber}
              </p>
            </div>

            {/* Bouton chapitre suivant */}
            <Button
              variant={hasNextChapter ? 'outline' : 'ghost'}
              size="md"
              onClick={goToNextChapter}
              disabled={!hasNextChapter}
              rightIcon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z" clipRule="evenodd" />
                </svg>
              }
            >
              Suivant
            </Button>
          </div>
        </div>
      </div>

      {/* Contenu : pages du chapitre */}
      <div className="max-w-4xl mx-auto py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2" style={{ borderColor: 'var(--color-royal-blue)' }}></div>
            <p className="mt-4 text-lg" style={{ color: 'var(--color-royal-blue)' }}>
              Chargement des pages...
            </p>
          </div>
        ) : pages.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl" style={{ color: 'var(--color-royal-blue-darker)' }}>
              Aucune page trouvée pour ce chapitre
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {pages.map((pageUrl, index) => (
              <div key={index} className="w-full">
                <img
                  src={pageUrl}
                  alt={`Page ${index + 1}`}
                  className="w-full h-auto"
                  loading="lazy"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement
                    img.style.display = 'none'
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}