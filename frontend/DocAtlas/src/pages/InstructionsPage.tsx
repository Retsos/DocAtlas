import { Link } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";

export default function InstructionsPage() {
  const { isAuthenticated } = useAuth();

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
            Setup steps
          </h2>
          <ol className="mt-4 space-y-4 list-decimal pl-5 text-sm text-slate-700 sm:text-base">
            <li>
              When you register, you'll be asked to provide your website URL. We
              use this later to install the chatbot on your site.
            </li>
            <li>Add files so the system can access your documents.</li>
            <li>
              Ingest & process. Documents are parsed, cleaned, and split into
              chunks for indexing and embeddings.
            </li>
            <li>
              Deploy. Copy the embed snippet or install the widget into your
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
          </ul>
          <p className="mt-4 text-sm text-slate-600">
            When you're ready to configure the widget, sign in and go to
            Dashboard → Widget Setup to perform the steps above.
          </p>

          <div className="mt-6 flex justify-center">
            {isAuthenticated ? (
              <Link
                to="/widget-setup"
                className="inline-flex items-center rounded-md bg-sky-950 px-4 py-2 text-sm font-medium text-white hover:bg-sky-800"
              >
                Go to Widget Setup
              </Link>
            ) : (
              <Link
                to="/auth"
                className="inline-flex items-center rounded-md bg-sky-950 px-4 py-2 text-sm font-medium text-white hover:bg-sky-800"
              >
                Sign in to get started
              </Link>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
