const frictions = [
  "Uncertainty around required supporting documents",
  "Confusion about institution-specific procedures",
  "Delays when staff search through fragmented files",
] as const;

export default function InstructionsPage() {
  return (
    <main className="px-4 py-12 sm:px-5 sm:py-16 lg:px-10 xl:px-14">
      <div className="mx-auto w-full max-w-6xl space-y-8 sm:space-y-10 lg:space-y-12">
        <header className="space-y-3 text-center">
          <h1 className="text-4xl font-dm-serif-display font-semibold leading-20 tracking-tight text-sky-950 sm:text-5xl md:text-7xl">
            How it works
          </h1>
        </header>

        <section className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm sm:p-7 lg:px-10 lg:py-9">
          <h2 className="text-2xl font-semibold tracking-tight text-sky-950 sm:text-3xl">
            High-level setup steps
          </h2>
          <ol className="mt-4 space-y-4 list-decimal pl-5 text-sm text-slate-700 sm:text-base">
            <li>
              Connect sources — add files or connect storage (Drive, S3,
              internal CMS) so the system can access your documents.
            </li>
            <li>
              Ingest & process — documents are parsed, cleaned, and split into
              chunks for indexing and embeddings.
            </li>
            <li>
              Review & curate — inspect extracted content, remove sensitive
              items, and optionally add clarifying context or QA pairs.
            </li>
            <li>
              Configure the widget — choose appearance, default prompts, and any
              routing or permissions for who can access the assistant.
            </li>
            <li>
              Deploy — copy the embed snippet or install the widget into your
              site so users can start asking questions.
            </li>
          </ol>
        </section>

        <section className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm sm:p-7 lg:px-10 lg:py-9">
          <h2 className="text-2xl font-semibold tracking-tight text-sky-950 sm:text-3xl">
            What you'll need
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-700 sm:text-base">
            <li>- Admin access to connect storage or upload files</li>
            <li>- Representative documents and common user questions</li>
            <li>
              - Optional: API keys for external storage or 3rd-party services
            </li>
          </ul>
          <p className="mt-4 text-sm text-slate-600">
            When you're ready to configure the widget for real, sign in and go
            to the Dashboard &gt; Widget Setup to perform the steps above.
          </p>
        </section>

        <section className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm sm:p-7 lg:px-10 lg:py-9">
          <h2 className="text-2xl font-semibold tracking-tight text-sky-950 sm:text-3xl">
            Main frictions reduced
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
