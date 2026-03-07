import { Link } from 'react-router-dom'

import { useLanguage } from '@/app/providers/language-provider'

export function WebsiteFooter() {
  const currentYear = new Date().getFullYear()
  const { t } = useLanguage()

  return (
    <footer className="relative border-t border-emerald-800 bg-emerald-950 px-5 py-10 text-emerald-50">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className="relative mx-auto grid w-full max-w-6xl gap-6 text-sm md:grid-cols-3">
        <div>
          <p className="text-base font-semibold text-emerald-100">DocAtlas</p>
          <p className="mt-2 text-emerald-100/90">{t('website.footer.description')}</p>
        </div>

        <div>
          <p className="font-semibold text-emerald-100">{t('website.footer.company')}</p>
          <ul className="mt-2 space-y-1">
            <li><Link to="/website/features" className="text-emerald-100/90 hover:text-white">{t('website.footer.features')}</Link></li>
            <li><Link to="/website/about" className="text-emerald-100/90 hover:text-white">{t('website.footer.about')}</Link></li>
          </ul>
        </div>

        <div>
          <p className="font-semibold text-emerald-100">{t('website.footer.contact')}</p>
          <p className="mt-2 text-emerald-100/90">team@docatlas.ai</p>
          <p className="mt-3 text-xs text-emerald-100/75">Copyright (c) {currentYear} DocAtlas. {t('website.footer.copyrightSuffix')}</p>
        </div>
      </div>
    </footer>
  )
}
