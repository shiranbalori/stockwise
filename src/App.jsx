import { Routes, Route } from 'react-router-dom'
import AppLayout from './layout/AppLayout'
import SearchPage from './pages/SearchPage'
import CategoriesPage from './pages/CategoriesPage'
import NewsPageRoute from './pages/NewsPageRoute'
import FavoritesPage from './pages/FavoritesPage'
import QuizPage from './pages/QuizPage'
import StockPage from './pages/StockPage'

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<SearchPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="news" element={<NewsPageRoute />} />
        <Route path="favorites" element={<FavoritesPage />} />
        <Route path="quiz" element={<QuizPage />} />
        <Route path="stock/:symbol" element={<StockPage />} />
      </Route>
    </Routes>
  )
}

export default App
