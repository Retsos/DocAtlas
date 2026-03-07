import { Navigate, Route, Routes } from 'react-router-dom'

import { WebsiteLayout } from '@/website/layouts/website-layout'
import { AboutPage } from '@/website/pages/about-page'
import { FeaturesPage } from '@/website/pages/features-page'
import { HomePage } from '@/website/pages/home-page'

export function WebsiteRouter() {
  return (
    <Routes>
      <Route element={<WebsiteLayout />}>
        <Route index element={<HomePage />} />
        <Route path="features" element={<FeaturesPage />} />
        <Route path="about" element={<AboutPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/website" replace />} />
    </Routes>
  )
}
