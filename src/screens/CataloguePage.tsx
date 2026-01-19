import { useEffect } from "react"
import { useCatalogueStore } from "../stores/catalogueStore"
import MangaCard from "../components/MangaCard"

export default function CataloguePage() {
  const { catalogue, getCatalogue } = useCatalogueStore()

  useEffect(() => {
    getCatalogue()
  }, [getCatalogue])

  return (
    <div className="min-h-screen"> 
      <div className="m-20">
        <div className="text-2xl font-bold mb-4" style={{ color: 'var(--color-royal-blue-darker)' }}>Mon Catalogue</div>
        <div className="flex flex-row flex-wrap gap-4">
          {catalogue.map((manga) => (
            <MangaCard key={manga.id} manga={manga} />
          ))}
        </div>
      </div>
    </div>
  )
}