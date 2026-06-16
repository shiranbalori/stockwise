const MOCK_STOCKS = {
  AAPL: {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 189.84,
    change: 2.31,
    changePercent: 1.23,
    metrics: {
      marketCap: '2.93T',
      peRatio: '29.4',
      eps: '6.46',
      dividendYield: '0.52%',
      week52High: '199.62',
      week52Low: '164.08',
      volume: '52.1M',
    },
    news: [
      'אפל חשפה יכולות AI חדשות ל-iPhone באירוע המפתחים האחרון.',
      'הכנסות השירותים ממשיכות לגדול ומאזנות מחזורי חומרה איטיים יותר.',
      'אנליסטים מציינים נאמנות מותג חזקה בקרב צרכנים.',
    ],
    aiAnalysis:
      'אפל נותרת מנהיגה טכנולוגית מגוונת עם אקוסיסטם חזק. ההכנסות מגוונות בין חומרה, שירותים ולביש. למטרות לימוד, היא נלמדת לעיתים כדוגמה ליציבות של חברות גדולות — אך ביצועי עבר אינם מנבאים תוצאות עתידיות.',
    riskLevel: 'Low',
    rating: 'Interesting',
    chartPoints: [182, 184, 183, 186, 185, 187, 189, 188, 190, 189.84],
  },
  NVDA: {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    price: 875.42,
    change: -12.18,
    changePercent: -1.37,
    metrics: {
      marketCap: '2.15T',
      peRatio: '65.2',
      eps: '13.42',
      dividendYield: '0.03%',
      week52High: '974.00',
      week52Low: '392.30',
      volume: '38.7M',
    },
    news: [
      'הביקוש לשבבי AI למרכזי נתונים נותר נושא מרכזי בתעשייה.',
      'התחרות בשוק כרטיסי המסך (GPU) מתגברת בין שחקנים גדולים.',
      'מגבלות שרשרת האספקה התמתנו בהשוואה לרבעונים קודמים.',
    ],
    aiAnalysis:
      'NVIDIA קשורה באופן הדוק לטרנדים של AI וצמיחת מרכזי נתונים. השווי שלה משקף ציפיות צמיחה גבוהות, מה שעלול להוביל לתנודתיות מחיר גדולה יותר. זה נפוץ בהקשרים לימודיים לדיון בפשרה בין צמיחה לתנודתיות — ולא כאות קנייה או מכירה.',
    riskLevel: 'High',
    rating: 'Risky',
    chartPoints: [890, 895, 888, 882, 878, 880, 876, 872, 878, 875.42],
  },
  MSFT: {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    price: 415.67,
    change: 3.45,
    changePercent: 0.84,
    metrics: {
      marketCap: '3.09T',
      peRatio: '34.8',
      eps: '11.94',
      dividendYield: '0.72%',
      week52High: '430.82',
      week52Low: '362.90',
      volume: '21.3M',
    },
    news: [
      'צמיחת הכנסות הענן ממשיכה להיות נקודת מוקד למשקיעים.',
      'Microsoft מרחיבה שילובי AI במוצרי Office ו-Azure.',
      'לקוחות ארגוניים מראים אימוץ יציב של שירותי מנוי.',
    ],
    aiAnalysis:
      'Microsoft משלבת תשתיות ענן, תוכנות פרודוקטיביות והשקעות ב-AI. היא מצוטטת לעיתים קרובות כדוגמה לחברת ענק מגוונת. הניתוח הלימודי מתמקד במודלים של הכנסה חוזרת — תמיד יש לקחת בחשבון מחקר עצמי וסבילות סיכון.',
    riskLevel: 'Low',
    rating: 'Interesting',
    chartPoints: [408, 410, 409, 412, 411, 413, 414, 412, 416, 415.67],
  },
  SOFI: {
    symbol: 'SOFI',
    name: 'SoFi Technologies, Inc.',
    price: 8.92,
    change: 0.18,
    changePercent: 2.06,
    metrics: {
      marketCap: '9.4B',
      peRatio: 'N/A',
      eps: '-0.12',
      dividendYield: '0.00%',
      week52High: '12.45',
      week52Low: '6.01',
      volume: '18.9M',
    },
    news: [
      'SoFi מדווחת על גידול בחברות בפלטפורמת הבנקאות הדיגיטלית.',
      'מימון מחדש של הלוואות סטודנטים נותר מגזר עסקי מרכזי.',
      'מגזר הפינטק מתמודד עם ביקורת רגולטורית וסביבת ריבית.',
    ],
    aiAnalysis:
      'SoFi היא חברת פינטק קטנה יותר עם תנודתיות גבוהה יותר מעמיתותיה הגדולות. היא יכולה להמחיש כיצד חברות בשלב צמיחה מאזנות בין התרחבות לאתגרי רווחיות. הדירוג הלימודי משקף אי-ודאות מוגברת — זה אינו המלצה.',
    riskLevel: 'Medium',
    rating: 'Neutral',
    chartPoints: [8.5, 8.6, 8.55, 8.7, 8.65, 8.8, 8.75, 8.85, 8.9, 8.92],
  },
}

export function getMockStock(symbol) {
  const key = symbol?.trim().toUpperCase()
  return MOCK_STOCKS[key] ?? null
}

export function getAvailableTickers() {
  return Object.keys(MOCK_STOCKS)
}
