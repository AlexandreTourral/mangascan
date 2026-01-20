import { useCollectionStore } from '../stores/collectionStore'
import { useCurrentMangaStore } from '../stores/currentMangaStore'
import type { Manga } from '../stores/catalogueStore/types'
import Button from './Button'
import { useNavigate } from 'react-router-dom'
import { animeSamaService } from '../services/animeSamaService'

interface MangaCardProps {
  manga: Manga
  onClick?: () => void
  DisplayIn?: 'collection' | 'readingList'
  isAddedToCollection?: boolean
}

export default function MangaCard({ manga, onClick, DisplayIn, isAddedToCollection}: MangaCardProps) {
  const navigate = useNavigate()
  const { addToCollection, removeFromCollection } = useCollectionStore()
  const { getMangaProgress, removeFromReadingList } = useCurrentMangaStore()
  const mangaProgress = getMangaProgress(manga.id)
  
  const hasNewChapters = DisplayIn === 'readingList' && 
    manga.chapters !== undefined && 
    mangaProgress && 
    manga.chapters > mangaProgress.highestChapter

  const handleAddToCollection = (e: React.MouseEvent) => {
    e.stopPropagation()
    addToCollection(manga)
  }

  const handleRemoveFromCollection = (e: React.MouseEvent) => {
    e.stopPropagation()
    removeFromCollection(manga.id)
  }

  const handleRemoveFromReadingList = (e: React.MouseEvent) => {
    e.stopPropagation()
    removeFromReadingList(manga.id)
  }

  const handleResumeReading = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigate(`/manga/${manga.id}/chapter/${mangaProgress?.highestChapter}`)
  }

  return (
    <div 
      className="shrink-0 transition-transform duration-300 hover:scale-105"
    >
      <div className="relative rounded-xl overflow-hidden shadow-lg bg-white">
        {/* Badge pour nouveaux chapitres */}
        {hasNewChapters && (
          <div className="absolute top-3 left-3 z-10 px-2 py-1 rounded-full bg-red-500 text-white text-xs font-semibold flex items-center gap-1 shadow-lg animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
              <path d="M10.5 3.75a6 6 0 0 0-5.25 3.006 3.75 3.75 0 0 0 .223 5.067 3.75 3.75 0 0 1 .223 5.067A6 6 0 0 0 10.5 20.25a6 6 0 0 0 5.25-3.006 3.75 3.75 0 0 0-.223-5.067 3.75 3.75 0 0 1-.223-5.067A6 6 0 0 0 10.5 3.75Z" />
            </svg>
            Nouveau
          </div>
        )}
        {/* Croix pour supprimer de la reading list */}
        {DisplayIn === 'readingList' && (
          <button
            onClick={handleRemoveFromReadingList}
            className="absolute top-3 right-2 z-10 w-8 h-8 cursor-pointer rounded-full bg-white shadow-lg flex items-center justify-center transition-all hover:bg-red-50 hover:shadow-xl"
            style={{ color: 'var(--color-royal-blue)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 hover:text-red-500 transition-colors">
              <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
            </svg>
          </button>
        )}
        {/* Image du manga */}
        <div 
          className="relative h-72 w-auto overflow-hidden cursor-pointer"
          onClick={onClick}
        >
          <img 
            src={manga.image} 
            alt={manga.title}
            className="w-full h-full object-cover"
          />
          {/* Overlay au hover */}
          <div className="absolute inset-0 bg-black opacity-0 hover:opacity-20 transition-opacity duration-300" />
        </div>
        
        {/* Informations du manga */}
        <div className="p-4 flex flex-col items-center gap-3">
          <div className="font-bold text-sm line-clamp-2 text-center" style={{ color: 'var(--color-royal-blue-darker)' }}>
            {manga.title}
          </div>
          
          {/* Affichage du chapitre */}
          {DisplayIn === 'readingList' && mangaProgress ? (
            // Si dans reading list : affiche le chapitre en cours
            <div className="flex items-center gap-2">
              <div 
                className="text-xs font-medium px-2 py-1 rounded-full flex w-fit"
                style={{ 
                  backgroundColor: 'rgba(0, 71, 171, 0.1)',
                  color: 'var(--color-royal-blue)'
                }}
              >
                Chapitre {animeSamaService.getDisplayChapterNumber(manga.title, mangaProgress.highestChapter)}
                {hasNewChapters && manga.chapters !== undefined && (
                  <span className="ml-1">/ {animeSamaService.getDisplayChapterNumber(manga.title, manga.chapters)}</span>
                )}
              </div>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" style={{ color: 'var(--color-royal-blue)' }}>
                  <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z" clipRule="evenodd" />
                </svg>
            </div>
          ) : DisplayIn === 'collection' && manga.chapters !== undefined ? (
            // Sinon : affiche le nombre total de chapitres
            <div 
              className="text-xs font-medium px-2 py-1 rounded-full flex w-fit"
              style={{ 
                backgroundColor: 'rgba(0, 71, 171, 0.1)',
                color: 'var(--color-royal-blue)'
              }}
            >
              chapitre {animeSamaService.getDisplayChapterNumber(manga.title, manga.chapters)}
            </div>
          ) : null}


          {/* Bouton d'action : soit reading list, soit collection */}
          {DisplayIn === 'collection'
            ? <Button variant="secondary" size="sm" onClick={handleRemoveFromCollection} className="w-full cursor-pointer">
                Retirer de la collection
              </Button>
            : null
          }

          {DisplayIn === 'readingList'
            ? <Button 
                variant="primary" 
                size="sm" 
                onClick={handleResumeReading} 
                className="w-full cursor-pointer"
                rightIcon={
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.25a.75.75 0 0 0 1 .707A8.237 8.237 0 0 1 6 18.75c1.995 0 3.823.707 5.25 1.886V4.533ZM12.75 20.636A8.214 8.214 0 0 1 18 18.75c.966 0 1.89.166 2.75.47a.75.75 0 0 0 1-.708V4.262a.75.75 0 0 0-.5-.707A9.735 9.735 0 0 0 18 3a9.707 9.707 0 0 0-5.25 1.533v16.103Z" />
                  </svg>
                }
              >
                Reprendre votre lecture
              </Button>
            : null
          }

          {DisplayIn === undefined && !isAddedToCollection
          ? <Button
              variant="primary"
              size="sm"
              onClick={handleAddToCollection}
              className="w-full cursor-pointer"
             >
               Ajouter à ma collection
             </Button>
          : DisplayIn === undefined && isAddedToCollection
            ? <Button
                variant="primary"
                size="sm"
                onClick={handleAddToCollection}
                className="w-full cursor-pointer"
                disabled={true}
               >
                Déjà dans ma collection
              </Button>
            : null
          }
        </div>
      </div>
    </div>
  )
}

