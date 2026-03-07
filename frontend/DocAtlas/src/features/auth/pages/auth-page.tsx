import { useState, type FormEvent } from 'react'
import { FirebaseError } from 'firebase/app'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '@/app/providers/auth-provider'

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
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-900/80">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="h-11 w-full rounded-lg border border-emerald-100 bg-emerald-50/40 px-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-300/30"
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
  const navigate = useNavigate()
  const location = useLocation()

  const redirectTo =
    (location.state as { from?: { pathname?: string } } | undefined)?.from?.pathname ??
    '/app/dashboard'

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
          setErrorMessage('Hospital name is required.')
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
          setErrorMessage('Firestore rules blocked this action. Check your database rules.')
        } else if (error.code === 'auth/email-already-in-use') {
          setErrorMessage('This email is already in use.')
        } else if (error.code === 'auth/invalid-credential') {
          setErrorMessage('Invalid email or password.')
        } else {
          setErrorMessage(error.message)
        }
      } else {
        setErrorMessage('Something went wrong. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-stone-100 bg-[radial-gradient(ellipse_80%_60%_at_70%_-10%,rgba(134,239,172,0.25)_0%,transparent_60%),radial-gradient(ellipse_50%_40%_at_5%_90%,rgba(147,197,253,0.2)_0%,transparent_55%)] p-6">
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_24px_64px_rgba(0,0,0,0.08)] md:grid-cols-2">
        <aside className="relative flex flex-col justify-between bg-emerald-950 p-10 text-emerald-50">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:40px_40px]" />

          <div className="relative flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg border border-emerald-300/40 bg-emerald-400/20">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" className="size-4 stroke-emerald-200">
                <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-xl font-semibold tracking-tight">DocAtlas</p>
          </div>

          <div className="relative space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">Admin Platform</p>
            <h2 className="text-3xl font-semibold leading-tight tracking-tight">
              Your institution's knowledge, always at hand.
            </h2>
            <p className="max-w-xs text-sm leading-6 text-emerald-100/75">
              AI assistant for hospitals grounded on your own files, URLs and operational docs.
            </p>
          </div>

          <div className="relative space-y-2 text-xs text-emerald-100/70">
            {[
              'Document ingestion and RAG',
              'Institution-specific answers',
              'Source-cited responses',
              'Patient and staff ready',
            ].map((item) => (
              <p key={item} className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-emerald-300" />
                {item}
              </p>
            ))}
          </div>
        </aside>

        <section className="p-10">
          <div className="mb-8 space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              {mode === 'login' ? 'Welcome back' : 'Register your hospital'}
            </h1>
            <p className="text-sm text-slate-500">
              {mode === 'login'
                ? 'Sign in to manage your knowledge base and settings.'
                : 'Create an admin account linked to your organization.'}
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
                'rounded-md px-3 py-2 text-sm font-medium transition',
                mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800',
              ].join(' ')}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register')
                setErrorMessage('')
              }}
              className={[
                'rounded-md px-3 py-2 text-sm font-medium transition',
                mode === 'register'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800',
              ].join(' ')}
            >
              Register
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {mode === 'register' && (
              <InputField
                id="hospital-name"
                label="Hospital Name"
                value={hospitalName}
                onChange={setHospitalName}
                placeholder="e.g. Hygeia Hospital"
              />
            )}

            <InputField
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="admin@hospital.gr"
            />

            <InputField
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="********"
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="h-11 w-full rounded-lg bg-emerald-950 text-sm font-semibold text-emerald-50 transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? 'Please wait...'
                : mode === 'login'
                  ? 'Sign in to DocAtlas'
                  : 'Create hospital account'}
            </button>

            {errorMessage && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {errorMessage}
              </p>
            )}
          </form>
        </section>
      </div>
    </main>
  )
}
