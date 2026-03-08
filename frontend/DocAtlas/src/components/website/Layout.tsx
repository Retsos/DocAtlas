import { Outlet } from 'react-router-dom'

import { Footer } from '@/components/website/Footer'
import { Navbar } from '@/components/website/Navbar'

export function Layout() {
  return (
    <div className="flex min-h-dvh scroll-smooth flex-col bg-stone-100 text-slate-900">
      <Navbar />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  )
}
