import { useEffect } from 'react'
import Carousel from '../components/Carousel'
import MangaCard from '../components/MangaCard'
import { useCatalogueStore } from '../stores/catalogueStore'
import { useCollectionStore } from '../stores/collectionStore'
import { useCurrentMangaStore } from '../stores/currentMangaStore'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'

export default function HomePage() {
  const { catalogue, isLoading, error, getCatalogue } = useCatalogueStore()
  const { collection } = useCollectionStore()
  const { readingList } = useCurrentMangaStore()
  const navigate = useNavigate()

  useEffect(() => {
    getCatalogue()
  }, [getCatalogue])

  const handleClickManga = (id: number) => {
    navigate(`/manga/${id}`)
  }

  if (isLoading && catalogue.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 mb-4" 
               style={{ borderColor: 'var(--color-royal-blue)' }}
          />
          <p className="text-lg" style={{ color: 'var(--color-royal-blue)' }}>
            Chargement des mangas...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    console.warn('Erreur API, utilisation des données d\'exemple:', error)
  }

  if (readingList.length < 1 && collection.length < 1) {
    return (
        <div className='flex flex-col items-center justify-center gap-4 min-h-screen'>
          <div className='text-2xl font-bold' style={{ color: 'var(--color-royal-blue-darker)' }}> Vous n'avez aucun manga en cours de lecture ou dans votre collection  </div>
          <div> Vous pouvez ajouter des mangas à votre collection en cliquant sur le bouton "Ajouter à ma collection" sur le catalogue </div>
          <Button variant="outline" size="lg" onClick={() => navigate('/catalogue')}>
            Aller au catalogue
          </Button>
        </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col gap-12">
          {/* Carousel des mangas en cours */}
          {readingList.length > 0 && (
            <section>
              <Carousel title="Reprenez vos mangas en cours">
                {readingList.map((manga) => (
                  <MangaCard
                    key={manga.id}
                    manga={manga}
                    onClick={() => handleClickManga(manga.id)}
                    DisplayIn="readingList"
                  />
                ))}
              </Carousel>
            </section>
          )}
          
          {/* Carousel de ma collection */}
          {collection.length > 0 && (
            <section>
              <Carousel title="Ma Collection">
                {collection.map((manga) => (
                  <MangaCard
                    key={manga.id}
                    manga={manga}
                    onClick={() => handleClickManga(manga.id)}
                    DisplayIn="collection"
                  />
                ))}
              </Carousel>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
