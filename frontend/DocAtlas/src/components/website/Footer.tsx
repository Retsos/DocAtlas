import { Link } from "react-router-dom";
import docAtlasLogo from "@/assets/DocAtlasLogo.png";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-emerald-200 px-4 py-8 sm:px-5 sm:py-10 lg:px-10 xl:px-14">
      <div className="mx-auto grid w-full max-w-6xl items-start gap-8 text-sm sm:gap-6 md:grid-cols-3 md:gap-10">
        <div>
          <Link to="/" className="inline-flex items-start">
            <img
              src={docAtlasLogo}
              alt="DocAtlas logo"
              className="h-18 w-18 object-contain drop-shadow-[0_8px_14px_rgba(5,150,105,0.32)]"
            />
          </Link>
        </div>

        <div className="space-y-3">
          <p className="font-semibold text-emerald-900/90">Company</p>
          <ul className="space-y-2">
            <li>
              <Link
                to="/features"
                className="text-emerald-700/90 transition hover:text-emerald-600"
              >
                Features
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className="text-emerald-700/90 transition hover:text-emerald-600"
              >
                About
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <p className="font-semibold text-emerald-900/90">Contact</p>
          <p className="text-emerald-700/90">team@docatlas.ai</p>
          <p className="max-w-sm text-xs leading-5 text-emerald-700/75">
            Copyright (c) {currentYear} DocAtlas. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
