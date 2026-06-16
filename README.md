# StockWise

אפליקציית ניתוח מניות **לימודית** בעברית (RTL). נבנתה עם React, Vite, Tailwind CSS, Firebase ו-Finnhub.

> **הצהרה:** המידע באתר מיועד למחקר ולימוד בלבד ואינו מהווה ייעוץ השקעות.

## Features

- נתוני מניות חיים מ-Finnhub (כל סימול תקף)
- גיבוי לנתוני דemo אם ה-API נכשל
- מועדפים והיסטוריית חיפושים ב-Firestore (עם localStorage כגיבוי)
- התחברות אנונימית אוטומטית ב-Firebase

## Local Development

```bash
npm install
cp .env.example .env   # fill in your credentials
npm run dev
```

Open [http://localhost:3003](http://localhost:3003)

## Environment Variables

Copy `.env.example` to `.env` and set all values. **Never commit `.env` to GitHub.**

| Variable | Required | Description |
| -------- | -------- | ----------- |
| `VITE_FIREBASE_API_KEY` | Yes | Firebase web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Yes | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Yes | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Yes | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Yes | Firebase sender ID |
| `VITE_FIREBASE_APP_ID` | Yes | Firebase app ID |
| `VITE_STOCK_API_KEY` | Yes | Finnhub API key |
| `VITE_STOCK_API_BASE_URL` | No | Defaults to `https://finnhub.io/api/v1` |

For production, set these in your hosting provider **before** the build step. Vite embeds `VITE_*` variables at build time.

## Production Deployment

### Build

```bash
npm run build
npm run preview   # test locally at http://localhost:3001
```

### Firebase Hosting (recommended)

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Link project: `firebase use your-project-id`
4. Set environment variables, then deploy:

```bash
npm run deploy:firebase
```

`firebase.json` is included with SPA rewrites and asset caching.

### Vercel / Netlify

- **Build command:** `npm run build`
- **Output directory:** `dist`
- Add all `VITE_*` environment variables in the dashboard
- SPA routing: `vercel.json` and `public/_redirects` are included

## Firebase Setup

1. Enable **Authentication → Anonymous sign-in**
2. Create a **Firestore** database
3. Apply security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Scripts

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Dev server (port 3003) |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build |
| `npm run deploy:firebase` | Build + deploy to Firebase Hosting |

## Tech Stack

- [React](https://react.dev/) + [Vite](https://vite.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Firebase](https://firebase.google.com/) (Auth + Firestore)
- [Finnhub](https://finnhub.io/) (Market data)
