import { Outlet } from 'react-router-dom'

import { WebsiteFooter } from '@/website/components/website-footer'
import { WebsiteNavbar } from '@/website/components/website-navbar'

export function WebsiteLayout() {
  return (
    <div className="flex min-h-screen scroll-smooth flex-col bg-stone-100 text-slate-900">
      <WebsiteNavbar />
      <div className="flex-1">
        <Outlet />
      </div>
      <WebsiteFooter />
    </div>
  )
}
