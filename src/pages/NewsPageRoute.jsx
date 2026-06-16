import { useNavigate, useLocation } from 'react-router-dom'
import NewsPage from '../components/NewsPage'
import { stockPath, saveReturnPath } from '../utils/navigation'

export default function NewsPageRoute() {
  const navigate = useNavigate()
  const location = useLocation()

  function openStock(symbol) {
    saveReturnPath(`${location.pathname}${location.search}`)
    navigate(stockPath(symbol), { state: { from: `${location.pathname}${location.search}` } })
  }

  return <NewsPage onAnalyze={openStock} />
}
