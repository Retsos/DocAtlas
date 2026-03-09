const capabilities = [
  "Document ingestion from PDF, Word, Excel, and internal files",
  "Vector search to retrieve the most relevant passages",
  "RAG responses tailored to each institution process",
  "Source citations for transparency and verification",
] as const;

export default function Features() {
  return (
    <main className="px-4 py-12 sm:px-5 sm:py-16 lg:px-10 xl:px-14">
      <div className="mx-auto w-full max-w-6xl space-y-8 sm:space-y-10 lg:space-y-12">
        <header className="space-y-3 text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-emerald-950 sm:text-5xl md:text-6xl">
            Features
          </h1>
          <p className="mx-auto max-w-3xl text-sm leading-6 text-slate-700 sm:text-base sm:leading-7">
            DocAtlas is an AI platform that acts as an institution-specific administrative assistant for healthcare organizations.
          </p>
        </header>

        <section className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-7 lg:px-10 lg:py-9">
          <h2 className="text-2xl font-semibold tracking-tight text-emerald-950 sm:text-3xl">
            What the idea is
          </h2>
          <div className="mt-4 space-y-4 text-sm leading-6 text-slate-700 sm:text-base sm:leading-7">
            <p>Each organization uploads its own documents, guidelines, and procedures, and the system answers based on those sources instead of generic web responses or a general LLM memory.</p>
            <p>The core combines document ingestion, vector search, and RAG: files become structured knowledge chunks, the most relevant passages are retrieved, and grounded answers are generated with source references.</p>
          </div>
        </section>

        <section className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-7 lg:px-10 lg:py-9">
          <h2 className="text-2xl font-semibold tracking-tight text-emerald-950 sm:text-3xl">
            Core capabilities
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {capabilities.map((capability) => (
              <li
                key={capability}
                className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-900 sm:text-base"
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
