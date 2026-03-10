import { Link } from "react-router-dom";

import docAtlasLogo from "@/assets/DocAtlasLogo.png";

export default function Home() {
  return (
    <main id="home">
      <section className="scroll-mt-24 px-4 pb-14 pt-10 sm:px-5 sm:pb-16 sm:pt-12 md:pb-20 md:pt-16 lg:px-10 xl:px-14">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-8 md:grid-cols-[1.2fr_0.8fr] md:gap-10 lg:gap-14">
          <div className="pt-10 space-y-5 sm:space-y-6">
            <h1 className="text-4xl font-dm-serif-display font-semibold leading-20 tracking-tight text-sky-950 sm:text-5xl md:text-7xl">
              Bring every hospital document into one{" "}
              <span className="text-sky-600">reliable AI assistant.</span>
            </h1>
            <p className="max-w-xl text-base font-barlow leading-6 text-sky-950 sm:text-xl sm:leading-7">
              DocAtlas organizes your internal files, protocols and links so
              patients gets instant, cited answers grounded in your own
              institution data.
            </p>
            <div className="sm:py-14 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <Link
                to="/auth"
                className="rounded-md bg-sky-950 px-5 py-3 text-center text-sm font-barlow-bold text-sky-50 transition hover:bg-sky-900"
              >
                Get Started
              </Link>
              <Link
                to="/about"
                className="rounded-md border border-sky-900 bg-white px-5 py-3 font-barlow-bold text-center text-sm text-sky-900 transition hover:border-sky-800 hover:text-sky-800"
              >
                Learn More
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-[0_25px_60px_rgba(30,64,175,0.12)] sm:p-6 md:p-7">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={docAtlasLogo}
                  alt="DocAtlas"
                  className="h-10 w-10 rounded-md object-cover"
                />
                <div>
                  <p className="text-sm font-barlow-bold font-semibold text-sky-950">
                    DocAtlas Assistant
                  </p>
                  <p className="text-xs font-barlow text-slate-500">
                    Institution-grounded responses
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-3 font-barlow text-sm">
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-sky-50 px-4 py-3 text-sky-950">
                  What should I bring with me for my MRI exam?
                </div>
              </div>
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-tr-md border border-sky-100 bg-white px-4 py-3 text-slate-900 shadow-sm">
                  Please bring a photo ID, your referral, and any prior imaging.
                  If you have implants or a pacemaker, let us know before your
                  visit.
                  <span className="mt-2 block text-xs text-slate-500">
                    Source: MRI-Prep-Checklist.pdf
                  </span>
                </div>
              </div>
              <div className="flex justify-start">
                <div className="max-w-[70%] rounded-2xl rounded-tl-md bg-slate-100 px-3 py-2 text-xs text-slate-500">
                  Answer grounded in 2 institutional documents.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
