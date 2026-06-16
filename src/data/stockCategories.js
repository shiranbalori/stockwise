export const CATEGORIES_DISCLAIMER =
  'החלוקה לתחומים נועדה לסיוע במחקר בלבד ואינה המלצת השקעה.'

export const TRENDING_DISCLAIMER =
  'הדירוג מבוסס על כמות אזכורים ועניין תקשורתי בלבד, ואינו מהווה המלצת השקעה.'

export const STOCK_CATEGORIES = [
  {
    id: 'ai-chips',
    title: 'בינה מלאכותית ושבבים',
    tickers: ['NVDA', 'AMD', 'AVGO', 'TSM', 'ASML', 'MU'],
  },
  {
    id: 'cloud-software',
    title: 'ענן ותוכנה',
    tickers: ['MSFT', 'AMZN', 'GOOGL', 'CRM', 'ORCL', 'NOW'],
  },
  {
    id: 'cybersecurity',
    title: 'סייבר',
    tickers: ['CRWD', 'PANW', 'ZS', 'FTNT', 'NET'],
  },
  {
    id: 'ev-energy',
    title: 'רכבים חשמליים ואנרגיה',
    tickers: ['TSLA', 'RIVN', 'ENPH', 'FSLR'],
  },
  {
    id: 'finance-fintech',
    title: 'פיננסים ופינטק',
    tickers: ['JPM', 'BAC', 'SOFI', 'PYPL', 'SQ'],
  },
  {
    id: 'health-biotech',
    title: 'בריאות וביוטק',
    tickers: ['LLY', 'NVO', 'PFE', 'MRK', 'MRNA'],
  },
  {
    id: 'retail-consumer',
    title: 'קמעונאות וצריכה',
    tickers: ['COST', 'WMT', 'HD', 'NKE', 'SBUX'],
  },
  {
    id: 'space-quantum',
    title: 'חלל וקוונטים',
    tickers: ['RKLB', 'LUNR', 'IONQ', 'RGTI', 'QBTS'],
  },
]

export function getCategoryById(id) {
  return STOCK_CATEGORIES.find((c) => c.id === id) ?? null
}
