const frictions = [
  "Uncertainty around required supporting documents",
  "Confusion about institution-specific procedures",
  "Delays when staff search through fragmented files",
] as const;

export default function InstractionsPage() {
  return (
    <main className="px-4 py-12 sm:px-5 sm:py-16 lg:px-10 xl:px-14">
      <div className="mx-auto w-full max-w-6xl space-y-8 sm:space-y-10 lg:space-y-12">
        <header className="space-y-3 text-center">
          <h1 className="text-4xl font-dm-serif-display font-semibold leading-20 tracking-tight text-sky-950 sm:text-5xl md:text-7xl">
            About Us
          </h1>
        </header>

        <section className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm sm:p-7 lg:px-10 lg:py-9">
          <h2 className="text-2xl font-semibold tracking-tight text-sky-950 sm:text-3xl">
            What problem it solves
          </h2>
          <div className="mt-4 space-y-4 text-sm leading-6 text-slate-700 sm:text-base sm:leading-7">
            <p>
              In healthcare organizations, knowledge is scattered across PDFs,
              Word files, Excel lists, internal docs, portals, emails, FAQs, and
              informal staff know-how.
            </p>
            <p>
              Patients and staff lose time finding what they need, and often
              receive different answers depending on who they ask.
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm sm:p-7 lg:px-10 lg:py-9">
          <h2 className="text-2xl font-semibold tracking-tight text-sky-950 sm:text-3xl">
            The main frictions it reduces
          </h2>
          <ul className="mt-4 space-y-3">
            {frictions.map((friction) => (
              <li
                key={friction}
                className="rounded-lg bg-sky-50 px-4 py-3 text-sm text-sky-900 sm:text-base"
              >
                {friction}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
