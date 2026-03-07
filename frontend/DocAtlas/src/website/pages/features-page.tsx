import { useLanguage } from '@/app/providers/language-provider'

export function FeaturesPage() {
  const { t } = useLanguage()

  return (
    <main className="flex min-h-[60vh] items-center justify-center px-5 py-16">
      <h1 className="text-6xl font-semibold tracking-tight text-emerald-950 md:text-7xl">{t('website.pages.featuresTitle')}</h1>
    </main>
  )
}
