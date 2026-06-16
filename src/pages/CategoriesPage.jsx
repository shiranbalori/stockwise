import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import StockCategories from '../components/StockCategories'
import { stockPath, saveReturnPath } from '../utils/navigation'

export default function CategoriesPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedCategoryId = searchParams.get('category')

  function handleSelectCategory(categoryId) {
    if (categoryId) {
      setSearchParams({ category: categoryId })
    } else {
      setSearchParams({})
    }
  }

  function openStock(symbol) {
    saveReturnPath(`${location.pathname}${location.search}`)
    navigate(stockPath(symbol), { state: { from: `${location.pathname}${location.search}` } })
  }

  return (
    <StockCategories
      selectedCategoryId={selectedCategoryId}
      onSelectCategory={handleSelectCategory}
      onAnalyze={openStock}
      loading={false}
    />
  )
}
