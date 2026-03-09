import { Link } from "react-router-dom";

import docAtlasLogo from "@/assets/DocAtlasLogo.png";

export default function Home() {
  return (
    <main id="home">
      <section className="scroll-mt-24 px-4 pb-14 pt-10 sm:px-5 sm:pb-16 sm:pt-12 md:pb-20 md:pt-16 lg:px-10 xl:px-14">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-8 md:grid-cols-2 md:gap-10 lg:gap-14">
          <div className="pt-10 space-y-5 sm:space-y-6">
            <h1 className="text-3xl font-semibold leading-tight tracking-tight text-emerald-950 sm:text-4xl md:text-5xl">
              Bring every hospital document into one reliable AI assistant.
            </h1>
            <p className="max-w-xl text-sm leading-6 text-slate-700 sm:text-base sm:leading-7">
              DocAtlas organizes your internal files, protocols and links so staff gets instant, cited answers grounded in your own institution data.
            </p>
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <Link
                to="/auth"
                className="rounded-md bg-emerald-950 px-5 py-3 text-center text-sm font-semibold text-emerald-50 transition hover:bg-emerald-900"
              >
                Get Started
              </Link>
              <Link
                to="/about"
                className="rounded-md border border-emerald-200 bg-white px-5 py-3 text-center text-sm font-semibold text-emerald-900 transition hover:border-emerald-400"
              >
                Learn More
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-[0_25px_60px_rgba(6,78,59,0.1)] sm:p-6 md:p-7">
            <div className="mb-4 flex items-center gap-3">
              <img
                src={docAtlasLogo}
                alt="DocAtlas"
                className="h-10 w-10 rounded-md object-cover"
              />
              <div>
                <p className="text-sm font-semibold text-emerald-950">
                  DocAtlas Assistant
                </p>
                <p className="text-xs text-slate-500">
                  Institution-grounded responses
                </p>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="rounded-lg bg-emerald-50 p-3 text-emerald-900">
                What is the updated emergency stroke triage protocol?
              </div>
              <div className="rounded-lg border border-emerald-100 bg-white p-3 text-slate-700">
                Protocol v3.2 recommends CT within 20 minutes and immediate neurology consult activation after imaging. Source: Stroke-Protocol-2025.pdf
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
