const capabilities = [
  "Secure document ingestion (PDF, Word, Excel, intranet)",
  "High‑quality vector search for precise passage retrieval",
  "RAG answers grounded in your institution's sources",
  "Automatic source citations for traceability",
  "Role-based access and permissions",
  "Simple embed snippet for any website or portal",
] as const;

export default function Features() {
  return (
    <main className="px-4 py-12 sm:px-5 sm:py-16 lg:px-10 xl:px-14">
      <div className="mx-auto w-full max-w-6xl space-y-8 sm:space-y-10 lg:space-y-12">
        <header className="space-y-3 text-center">
          <h1 className="text-4xl font-dm-serif-display font-semibold leading-20 tracking-tight text-sky-950 sm:text-5xl md:text-7xl">
            Our Features
          </h1>
        </header>

        <section className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm sm:p-7 lg:px-10 lg:py-9">
          <h2 className="text-2xl font-semibold tracking-tight text-sky-950 sm:text-3xl">
            Purpose
          </h2>
          <div className="mt-4 space-y-4 text-sm leading-6 text-slate-700 sm:text-base sm:leading-7">
            <p>
              DocAtlas turns your institution's policies, guides, and internal
              knowledge into an assistant that provides fast, consistent, and
              auditable answers—so clinicians, staff and patients find the right
              information without hunting through folders or inboxes.
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm sm:p-7 lg:px-10 lg:py-9">
          <h2 className="text-2xl font-semibold tracking-tight text-sky-950 sm:text-3xl">
            Core Capabilities
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {capabilities.map((capability) => (
              <li
                key={capability}
                className="rounded-lg bg-sky-50 px-4 py-3 text-sm text-sky-900 sm:text-base"
              >
                {capability}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
