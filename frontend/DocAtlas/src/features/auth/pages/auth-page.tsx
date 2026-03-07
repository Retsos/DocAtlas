import { useState, type FormEvent } from 'react'
import { FirebaseError } from 'firebase/app'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '@/app/providers/auth-provider'
import { useLanguage } from '@/app/providers/language-provider'
import docAtlasLogo from '@/assets/DocAtlasLogo.png'

type AuthMode = 'login' | 'register'

function InputField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = true,
}: {
  id: string
  label: string
  type?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-900/80">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="h-12 w-full rounded-lg border border-emerald-100 bg-emerald-50/40 px-3 text-base text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-300/30"
      />
    </div>
  )
}

export function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login')
  const [hospitalName, setHospitalName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const { isAuthenticated, login, registerHospital } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()

  const redirectTo =
    (location.state as { from?: { pathname?: string } } | undefined)?.from?.pathname ?? '/app/dashboard'

  if (isAuthenticated) {
    return <Navigate to="/app/dashboard" replace />
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setErrorMessage('')

    try {
      if (mode === 'login') {
        await login({ email: email.trim(), password })
      } else {
        if (!hospitalName.trim()) {
          setErrorMessage(t('auth.errors.hospitalNameRequired'))
          return
        }

        await registerHospital({
          hospitalName: hospitalName.trim(),
          email: email.trim(),
          password,
        })
      }

      navigate(redirectTo, { replace: true })
    } catch (error) {
      if (error instanceof FirebaseError) {
        if (error.code === 'permission-denied') {
          setErrorMessage(t('auth.errors.permissionDenied'))
        } else if (error.code === 'auth/email-already-in-use') {
          setErrorMessage(t('auth.errors.emailInUse'))
        } else if (error.code === 'auth/invalid-credential') {
          setErrorMessage(t('auth.errors.invalidCredential'))
        } else {
          setErrorMessage(error.message)
        }
      } else {
        setErrorMessage(t('auth.errors.generic'))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="relative min-h-screen bg-stone-100 bg-[radial-gradient(ellipse_80%_60%_at_70%_-10%,rgba(134,239,172,0.25)_0%,transparent_60%),radial-gradient(ellipse_50%_40%_at_5%_90%,rgba(147,197,253,0.2)_0%,transparent_55%)] p-6 md:p-8">
      <div className="mx-auto mt-4 w-full max-w-7xl md:mt-6">
        <Link
          to="/website"
          className="mb-8 inline-flex items-center gap-2 rounded-md bg-white px-4 py-2.5 text-base font-semibold text-emerald-900 shadow-sm ring-1 ring-emerald-100 transition hover:bg-white"
        >
          <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden="true">
            <path
              d="M15 18l-6-6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>{t('auth.backToWebsite')}</span>
        </Link>
      </div>

      <div className="mx-auto grid w-full max-w-7xl overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_24px_64px_rgba(0,0,0,0.08)] md:min-h-[72vh] md:grid-cols-2">
        <aside className="relative flex flex-col items-center justify-center gap-1 bg-emerald-950 p-1 text-center text-emerald-50">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:40px_40px]" />

          <div className="relative flex justify-center">
            <img src={docAtlasLogo} alt="DocAtlas logo" className="size-80 object-contain" />
          </div>

          <div className="relative space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">{t('auth.adminPlatform')}</p>
            <h2 className="text-4xl font-semibold leading-tight tracking-tight">{t('auth.heroTitle')}</h2>
            <p className="mx-auto max-w-sm text-base leading-7 text-emerald-100/75">{t('auth.heroDescription')}</p>
          </div>

          <div className="relative space-y-2 text-sm text-emerald-100/70">
            {[
              t('auth.heroBullets.one'),
              t('auth.heroBullets.two'),
              t('auth.heroBullets.three'),
              t('auth.heroBullets.four'),
            ].map((item) => (
              <p key={item} className="flex items-center justify-center gap-2">
                <span className="size-1.5 rounded-full bg-emerald-300" />
                {item}
              </p>
            ))}
          </div>
        </aside>

        <section className="flex items-center justify-center p-10 md:p-12">
          <div className="w-full max-w-xl space-y-6 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                {mode === 'login' ? t('auth.headings.login') : t('auth.headings.register')}
              </h1>
              <p className="text-base text-slate-500">
                {mode === 'login' ? t('auth.subheadings.login') : t('auth.subheadings.register')}
              </p>
            </div>

            <div className="mb-6 grid grid-cols-2 rounded-lg bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => {
                  setMode('login')
                  setErrorMessage('')
                }}
                className={[
                  'rounded-md px-3 py-2.5 text-base font-medium transition',
                  mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800',
                ].join(' ')}
              >
                {t('auth.tabs.login')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register')
                  setErrorMessage('')
                }}
                className={[
                  'rounded-md px-3 py-2.5 text-base font-medium transition',
                  mode === 'register'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800',
                ].join(' ')}
              >
                {t('auth.tabs.register')}
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-4 text-left">
              {mode === 'register' && (
                <InputField
                  id="hospital-name"
                  label={t('auth.labels.hospitalName')}
                  value={hospitalName}
                  onChange={setHospitalName}
                  placeholder={t('auth.placeholders.hospitalName')}
                />
              )}

              <InputField
                id="email"
                label={t('auth.labels.email')}
                type="email"
                value={email}
                onChange={setEmail}
                placeholder={t('auth.placeholders.email')}
              />

              <InputField
                id="password"
                label={t('auth.labels.password')}
                type="password"
                value={password}
                onChange={setPassword}
                placeholder={t('auth.placeholders.password')}
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="h-12 w-full rounded-lg bg-emerald-950 text-base font-semibold text-emerald-50 transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting
                  ? t('auth.buttons.loading')
                  : mode === 'login'
                    ? t('auth.buttons.login')
                    : t('auth.buttons.register')}
              </button>

              {errorMessage && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p>
              )}
            </form>
          </div>
        </section>
      </div>
    </main>
  )
}
