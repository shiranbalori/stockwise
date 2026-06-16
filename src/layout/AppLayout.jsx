import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Header from '../components/Header'
import TopNav from '../components/TopNav'
import Footer from '../components/Footer'
import { useScrollRestoration } from '../hooks/useScrollRestoration'

export default function AppLayout() {
  useScrollRestoration()

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <Header />
      <TopNav />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <Outlet />
        <Footer />
      </main>
    </div>
  )
}
