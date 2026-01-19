import { Route, Routes } from "react-router-dom"
import HomePage from "./HomePage"
import Navbar from "../components/Navbar"
import CataloguePage from "./CataloguePage"
import MangaPage from "./MangaPage"
import ChapterPage from "./ChapterPage"

function Router() {

  return (
    <>
    <Navbar />
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/catalogue" element={<CataloguePage />} />
      <Route path="/manga/:id" element={<MangaPage />} />
      <Route path="/manga/:id/chapter/:chapter" element={<ChapterPage />} />
    </Routes>
    </>
  )
}

export default Router
