import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useCatalogueStore } from "../stores/catalogueStore"
import { useCurrentMangaStore } from "../stores/currentMangaStore"
import { animeSamaService } from "../services/animeSamaService"
import Button from "../components/Button"

export default function MangaPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { catalogue } = useCatalogueStore()
  const { addToReadingList, updateChapter, getMangaProgress } = useCurrentMangaStore()
  const manga = catalogue.find((manga) => manga.id === parseInt(id as string))
  const [selectedChapter, setSelectedChapter] = useState<number>(1)
  const [isOpen, setIsOpen] = useState(false)

  // Restaure le dernier chapitre lu si le manga est dans la reading list
  useEffect(() => {
    if (manga) {
      const progress = getMangaProgress(manga.id)
      if (progress) {
        setSelectedChapter(progress.highestChapter)
      }
    }
  }, [manga, getMangaProgress])

  if (!manga) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl" style={{ color: 'var(--color-royal-blue)' }}>
          Manga non trouvé
        </div>
      </div>
    )
  }

  const chapters = Array.from({ length: manga.chapters || 0 }, (_, i) => i + 1)
  const lastChapter = manga.chapters || 1

  const handleChapterSelect = (chapter: number) => {
    setSelectedChapter(chapter)
    setIsOpen(false)
    
    // Ajoute/met à jour le manga dans la reading list
    if (manga) {
      const progress = getMangaProgress(manga.id)
      if (progress) {
        updateChapter(manga.id, chapter)
      } else {
        addToReadingList(manga, chapter)
      }
    }
  }

  const handleGoToLastChapter = () => {
    setSelectedChapter(lastChapter)
    setIsOpen(false)
    
    // Ajoute/met à jour le manga dans la reading list
    if (manga) {
      const progress = getMangaProgress(manga.id)
      if (progress) {
        updateChapter(manga.id, lastChapter)
      } else {
        addToReadingList(manga, lastChapter)
      }
    }
  }

  const handleReadChapter = () => {
    if (manga) {
      const progress = getMangaProgress(manga.id)
      if (progress) {
        updateChapter(manga.id, selectedChapter)
      } else {
        addToReadingList(manga, selectedChapter)
      }
      navigate(`/manga/${manga.id}/chapter/${selectedChapter}`)
    }
  }
  
  const mangaProgress = manga ? getMangaProgress(manga.id) : undefined

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* En-tête avec image et infos */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex gap-8 items-start">
            <img 
              src={manga.image} 
              alt={manga.title}
              className="w-48 h-72 object-cover rounded-lg shadow-md"
            />
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--color-royal-blue-darker)' }}>
                {manga.title}
              </h1>
              <div className="flex items-center gap-2 text-gray-600">
                <span className="font-semibold">Total de chapitres:</span>
                <span 
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{ 
                    backgroundColor: 'rgba(0, 71, 171, 0.1)',
                    color: 'var(--color-royal-blue)'
                  }}
                >
                  {manga.chapters ? animeSamaService.getDisplayChapterNumber(manga.title, manga.chapters) : 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Menu déroulant des chapitres */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--color-royal-blue-darker)' }}>
              Sélectionner un chapitre
            </h2>
            <Button
              variant="outline"
              size="md"
              onClick={handleGoToLastChapter}
              rightIcon={
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 3 16.811V8.69ZM12.75 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061a1.125 1.125 0 0 1-1.683-.977V8.69Z" />
                </svg>
              }
            >
              Dernier chapitre ({animeSamaService.getDisplayChapterNumber(manga.title, lastChapter)})
            </Button>
          </div>
          
          <div className="relative w-full max-w-md">
            {/* Bouton du dropdown */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-full px-6 py-4 text-left rounded-lg border-2 font-semibold flex items-center justify-between transition-all hover:shadow-md"
              style={{ 
                borderColor: 'var(--color-royal-blue)',
                color: 'var(--color-royal-blue)'
              }}
            >
              <span>Chapitre {animeSamaService.getDisplayChapterNumber(manga.title, selectedChapter)}</span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Liste déroulante */}
            {isOpen && (
              <div className="absolute z-10 w-full mt-2 bg-white border-2 rounded-lg shadow-xl max-h-96 overflow-y-auto"
                   style={{ borderColor: 'var(--color-royal-blue)' }}>
                <div className="py-2">
                  {chapters.map((chapter) => (
                    <button
                      key={chapter}
                      onClick={() => handleChapterSelect(chapter)}
                      className={`w-full px-6 py-3 text-left hover:bg-blue-50 transition-colors ${
                        selectedChapter === chapter ? 'font-bold' : ''
                      }`}
                      style={{ 
                        color: selectedChapter === chapter ? 'var(--color-royal-blue)' : 'var(--color-royal-blue-dark)',
                        backgroundColor: selectedChapter === chapter ? 'rgba(0, 71, 171, 0.1)' : 'transparent'
                      }}
                    >
                      Chapitre {animeSamaService.getDisplayChapterNumber(manga.title, chapter)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Info du chapitre sélectionné */}
          <div className="mt-8 p-6 rounded-lg" style={{ backgroundColor: 'rgba(0, 71, 171, 0.05)' }}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-lg font-semibold" style={{ color: 'var(--color-royal-blue-darker)' }}>
                Chapitre sélectionné: <span style={{ color: 'var(--color-royal-blue)' }}>{animeSamaService.getDisplayChapterNumber(manga.title, selectedChapter)}</span>
              </p>
              {mangaProgress && (
                <div className="flex items-center gap-2 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" style={{ color: 'var(--color-royal-blue)' }}>
                    <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z" clipRule="evenodd" />
                  </svg>
                  <span style={{ color: 'var(--color-royal-blue)' }}>
                    Chapitre le plus avancé: {animeSamaService.getDisplayChapterNumber(manga.title, mangaProgress.highestChapter)}
                  </span>
                </div>
              )}
            </div>
            
            {/* Bouton pour lire le chapitre */}
            <Button
              variant="primary"
              size="lg"
              onClick={handleReadChapter}
              className="w-full"
              rightIcon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.25a.75.75 0 0 0 1 .707A8.237 8.237 0 0 1 6 18.75c1.995 0 3.823.707 5.25 1.886V4.533ZM12.75 20.636A8.214 8.214 0 0 1 18 18.75c.966 0 1.89.166 2.75.47a.75.75 0 0 0 1-.708V4.262a.75.75 0 0 0-.5-.707A9.735 9.735 0 0 0 18 3a9.707 9.707 0 0 0-5.25 1.533v16.103Z" />
                </svg>
              }
            >
              Lire le chapitre {animeSamaService.getDisplayChapterNumber(manga.title, selectedChapter)}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}