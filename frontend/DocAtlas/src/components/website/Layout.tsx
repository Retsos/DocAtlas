import { Outlet } from 'react-router-dom'

import { Footer } from '@/components/website/Footer'
import { Navbar } from '@/components/website/Navbar'

export function Layout() {
  return (
    <div className="flex min-h-dvh scroll-smooth flex-col bg-[radial-gradient(ellipse_70%_60%_at_10%_0%,rgba(110,231,183,0.28)_0%,transparent_65%),radial-gradient(ellipse_65%_55%_at_90%_20%,rgba(16,185,129,0.22)_0%,transparent_70%)] text-slate-900">
      <Navbar />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  )
}
