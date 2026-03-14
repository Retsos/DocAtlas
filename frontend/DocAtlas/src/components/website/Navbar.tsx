import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

import docAtlasLogoWithTitle from "@/assets/DocAtlasLogoWithTitle.png";

const navLinks = [
  { label: "Home", to: "/", end: true },
  { label: "Features", to: "/features" },
  { label: "Instructions", to: "/instructions" },
];

export function Navbar() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <header className="top-0 z-30 bg-transparent">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-5 md:h-[4.5rem] md:py-2">
        <button
          type="button"
          onClick={() => setIsMobileNavOpen((open) => !open)}
          aria-label="Toggle navigation menu"
          className="order-1 inline-flex h-10 w-10 items-center justify-center rounded-md border border-sky-200 text-sky-950 md:hidden"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M4 7h16M4 12h16M4 17h16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <NavLink
          to="/"
          className="order-3 ml-auto flex items-center gap-2 sm:gap-3 md:order-1 md:ml-0"
          onClick={() => setIsMobileNavOpen(false)}
        >
          <img
            src={docAtlasLogoWithTitle}
            alt="DocAtlas logo"
            className="h-28 w-28 object-contain pt-2 drop-shadow-[0_8px_14px_rgba(37,99,235,0.32)] sm:h-28 sm:w-28 md:h-44 md:w-44"
          />
        </NavLink>

        <nav
          aria-label="Website navigation"
          className="hidden md:order-2 md:flex md:flex-1 md:justify-center"
        >
          <ul className="flex items-center gap-8 text-base font-barlow text-sky-950">
            {navLinks.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    [
                      "transition hover:text-sky-600",
                      isActive ? "text-sky-600" : "text-sky-950",
                    ].join(" ")
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-2 md:order-3 md:flex">
          <Link
            to="/auth"
            className="rounded-md bg-sky-950 px-4 py-2 text-sm font-barlow-bold text-sky-50 transition hover:bg-sky-900"
          >
            Log in
          </Link>
        </div>
      </div>

      <div
        className={[
          "fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px] transition-opacity md:hidden",
          isMobileNavOpen ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
        onClick={() => setIsMobileNavOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={[
          "fixed left-0 top-0 z-50 h-full w-72 max-w-[85vw] border-r border-sky-100 bg-white/95 shadow-[0_20px_60px_rgba(15,23,42,0.18)] backdrop-blur-md transition-transform md:hidden",
          isMobileNavOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-between px-4 py-4">
          <span className="text-sm font-semibold text-slate-900">Menu</span>
          <button
            type="button"
            onClick={() => setIsMobileNavOpen(false)}
            aria-label="Close navigation menu"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-sky-200 text-sky-950"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M6 6l12 12M18 6l-12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <div className="px-4 pb-6">
          <ul className="space-y-2 text-base font-barlow text-sky-950">
            {navLinks.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  onClick={() => setIsMobileNavOpen(false)}
                  className={({ isActive }) =>
                    [
                      "block rounded-md px-3 py-2.5 transition",
                      isActive ? "bg-sky-50 text-sky-700" : "hover:bg-sky-50",
                    ].join(" ")
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
            <li className="pt-2">
              <Link
                to="/auth"
                onClick={() => setIsMobileNavOpen(false)}
                className="block rounded-md bg-sky-950 px-3 py-2.5 text-center text-base font-barlow-bold text-sky-50"
              >
                Log in
              </Link>
            </li>
          </ul>
        </div>
      </aside>
    </header>
  );
}
