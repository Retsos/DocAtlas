import { useEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

import { useLanguage } from '@/app/providers/language-provider'
import docAtlasLogo from '@/assets/DocAtlasLogo.png'

const navLinks = [
  { key: 'website.nav.home', to: '/', end: true },
  { key: 'website.nav.features', to: '/features' },
  { key: 'website.nav.about', to: '/about' },
]

function GreeceFlagIcon() {
  return (
    <svg viewBox="0 0 24 16" className="h-5 w-7 rounded-sm" aria-hidden="true">
      <rect width="24" height="16" fill="#0D5EAF" />
      <rect y="1.78" width="24" height="1.78" fill="#fff" />
      <rect y="5.33" width="24" height="1.78" fill="#fff" />
      <rect y="8.89" width="24" height="1.78" fill="#fff" />
      <rect y="12.44" width="24" height="1.78" fill="#fff" />
      <rect width="10.67" height="8.89" fill="#0D5EAF" />
      <rect x="4.44" width="1.78" height="8.89" fill="#fff" />
      <rect y="3.56" width="10.67" height="1.78" fill="#fff" />
    </svg>
  )
}

function UKFlagIcon() {
  return (
    <svg viewBox="0 0 24 16" className="h-5 w-7 rounded-sm" aria-hidden="true">
      <rect width="24" height="16" fill="#012169" />
      <path d="M0 0l24 16M24 0L0 16" stroke="#fff" strokeWidth="3.2" />
      <path d="M0 0l24 16M24 0L0 16" stroke="#C8102E" strokeWidth="1.4" />
      <path d="M12 0v16M0 8h24" stroke="#fff" strokeWidth="5" />
      <path d="M12 0v16M0 8h24" stroke="#C8102E" strokeWidth="3" />
    </svg>
  )
}

export function Navbar() {
  const { language, setLanguage, t } = useLanguage()
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false)
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const menuRef = useRef<HTMLLIElement | null>(null)

  useEffect(() => {
    function onDocumentClick(event: MouseEvent) {
      if (!menuRef.current) {
        return
      }

      if (!menuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false)
      }
    }

    document.addEventListener('click', onDocumentClick)
    return () => document.removeEventListener('click', onDocumentClick)
  }, [])

  return (
    <header className="sticky top-0 z-30 border-b border-emerald-100/70 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-5 md:h-[4.5rem] md:py-2">
        <NavLink
          to="/"
          className="flex items-center gap-2 sm:gap-3"
          onClick={() => setIsMobileNavOpen(false)}
        >
          <img
            src={docAtlasLogo}
            alt="DocAtlas logo"
            className="h-10 w-10 object-contain drop-shadow-[0_8px_14px_rgba(5,150,105,0.32)] sm:h-12 sm:w-12 md:h-14 md:w-14"
          />
          <span className="text-lg font-semibold tracking-tight text-emerald-950 sm:text-xl">DocAtlas</span>
        </NavLink>

        <nav aria-label="Website navigation" className="hidden md:block">
          <ul className="flex items-center gap-8 text-base font-semibold text-emerald-900/90">
            {navLinks.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    [
                      'transition hover:text-emerald-600',
                      isActive ? 'text-emerald-600' : 'text-emerald-900/90',
                    ].join(' ')
                  }
                >
                  {t(item.key)}
                </NavLink>
              </li>
            ))}
            <li ref={menuRef} className="relative ml-2">
              <button
                type="button"
                onClick={() => setIsLangMenuOpen((open) => !open)}
                className="inline-flex items-center gap-1 rounded-md border border-black/60 px-2 py-1 text-sm text-emerald-900 transition hover:border-black"
                aria-label="Switch language"
              >
                {language === 'el' ? <GreeceFlagIcon /> : <UKFlagIcon />}
                <span className="text-xs">▾</span>
              </button>

              {isLangMenuOpen && (
                <div className="absolute right-0 top-10 z-40 min-w-32 rounded-md border border-emerald-100 bg-white p-1 shadow-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setLanguage('el')
                      setIsLangMenuOpen(false)
                    }}
                    className={[
                      'flex w-full items-center justify-between rounded px-2 py-1.5 text-sm transition',
                      language === 'el'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-emerald-900 hover:bg-emerald-50',
                    ].join(' ')}
                  >
                    <span>Ελληνικά</span>
                    <GreeceFlagIcon />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLanguage('en')
                      setIsLangMenuOpen(false)
                    }}
                    className={[
                      'flex w-full items-center justify-between rounded px-2 py-1.5 text-sm transition',
                      language === 'en'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-emerald-900 hover:bg-emerald-50',
                    ].join(' ')}
                  >
                    <span>English</span>
                    <UKFlagIcon />
                  </button>
                </div>
              )}
            </li>
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsMobileNavOpen((open) => !open)}
            aria-label="Toggle navigation menu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-emerald-200 text-emerald-900 md:hidden"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          <Link
            to="/auth"
            className="hidden rounded-md bg-emerald-950 px-4 py-2 text-sm font-semibold text-emerald-50 transition hover:bg-emerald-900 md:inline-flex"
          >
            {t('website.nav.signIn')}
          </Link>
        </div>
      </div>

      {isMobileNavOpen && (
        <div className="border-t border-emerald-100 bg-white px-4 py-4 md:hidden">
          <ul className="space-y-1 text-sm font-semibold text-emerald-900">
            {navLinks.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  onClick={() => setIsMobileNavOpen(false)}
                  className={({ isActive }) =>
                    [
                      'block rounded-md px-3 py-2 transition',
                      isActive ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-emerald-50',
                    ].join(' ')
                  }
                >
                  {t(item.key)}
                </NavLink>
              </li>
            ))}
            <li className="pt-2">
              <Link
                to="/auth"
                onClick={() => setIsMobileNavOpen(false)}
                className="block rounded-md bg-emerald-950 px-3 py-2 text-center text-sm font-semibold text-emerald-50"
              >
                {t('website.nav.signIn')}
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}
