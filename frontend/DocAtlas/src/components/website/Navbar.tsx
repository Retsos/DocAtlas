import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

import docAtlasLogoWithTitle from "@/assets/DocAtlasLogoWithTitle.png";

const navLinks = [
  { label: "Home", to: "/", end: true },
  { label: "Features", to: "/features" },
  { label: "About", to: "/about" },
];

export function Navbar() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <header className="top-0 z-30 bg-transparent">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between pr-4 py-3 sm:pr-5 md:h-[4.5rem] md:py-2">
        <NavLink
          to="/"
          className="flex items-center gap-2 sm:gap-3"
          onClick={() => setIsMobileNavOpen(false)}
        >
          <img
            src={docAtlasLogoWithTitle}
            alt="DocAtlas logo"
            className="pt-2 h-10 w-10 object-contain drop-shadow-[0_8px_14px_rgba(37,99,235,0.32)] sm:h-12 sm:w-12 md:h-44 md:w-44"
          />
        </NavLink>

        <nav aria-label="Website navigation" className="hidden md:block">
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

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsMobileNavOpen((open) => !open)}
            aria-label="Toggle navigation menu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-sky-200 text-sky-950 md:hidden"
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

          <Link
            to="/auth"
            className="hidden rounded-md bg-sky-950 px-4 py-2 text-sm font-semibold text-sky-50 transition  md:inline-flex hover:bg-sky-900"
          >
            Log in
          </Link>
        </div>
      </div>

      {isMobileNavOpen && (
        <div className="border-t border-sky-100 bg-transparent px-4 py-4 md:hidden">
          <ul className="space-y-1 text-sm font-semibold text-sky-950">
            {navLinks.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  onClick={() => setIsMobileNavOpen(false)}
                  className={({ isActive }) =>
                    [
                      "block rounded-md px-3 py-2 transition",
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
                className="block rounded-md bg-sky-950 px-3 py-2 text-center text-sm font-semibold text-sky-50"
              >
                Log in
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
