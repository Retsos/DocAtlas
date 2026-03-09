import { useLanguage } from "@/providers/LanguageProvider";

const capabilityKeys = ["one", "two", "three", "four"] as const;

export default function Features() {
  const { t } = useLanguage();

  return (
    <main className="px-4 py-12 sm:px-5 sm:py-16 lg:px-10 xl:px-14">
      <div className="mx-auto w-full max-w-6xl space-y-8 sm:space-y-10 lg:space-y-12">
        <header className="space-y-3 text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-emerald-950 sm:text-5xl md:text-6xl">
            {t("website.pages.featuresTitle")}
          </h1>
          <p className="mx-auto max-w-3xl text-sm leading-6 text-slate-700 sm:text-base sm:leading-7">
            {t("website.pages.featuresIntro")}
          </p>
        </header>

        <section className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-7 lg:px-10 lg:py-9">
          <h2 className="text-2xl font-semibold tracking-tight text-emerald-950 sm:text-3xl">
            {t("website.pages.ideaTitle")}
          </h2>
          <div className="mt-4 space-y-4 text-sm leading-6 text-slate-700 sm:text-base sm:leading-7">
            <p>{t("website.pages.ideaParagraphOne")}</p>
            <p>{t("website.pages.ideaParagraphTwo")}</p>
          </div>
        </section>

        <section className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-7 lg:px-10 lg:py-9">
          <h2 className="text-2xl font-semibold tracking-tight text-emerald-950 sm:text-3xl">
            {t("website.pages.capabilitiesTitle")}
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {capabilityKeys.map((key) => (
              <li
                key={key}
                className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-900 sm:text-base"
              >
                {t(`website.pages.capabilities.${key}`)}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
