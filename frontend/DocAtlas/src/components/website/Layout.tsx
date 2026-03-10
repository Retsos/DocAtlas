import { Outlet } from 'react-router-dom'

import { Footer } from '@/components/website/Footer'
import { Navbar } from '@/components/website/Navbar'

export function Layout() {
  return (
    <div className="flex min-h-dvh scroll-smooth flex-col bg-[radial-gradient(ellipse_70%_60%_at_10%_0%,rgba(147,197,253,0.26)_0%,transparent_65%),radial-gradient(ellipse_65%_55%_at_90%_20%,rgba(56,189,248,0.2)_0%,transparent_70%)] text-slate-900">
      <Navbar />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  )
}
