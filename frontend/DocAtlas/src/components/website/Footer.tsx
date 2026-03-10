import { Link } from "react-router-dom";
import docAtlasLogo from "@/assets/DocAtlasLogo.png";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-sky-200 px-4 py-8 sm:px-5 sm:py-10 lg:px-10 xl:px-14">
      <div className="mx-auto grid w-full max-w-6xl items-start gap-8 text-sm sm:gap-6 md:grid-cols-3 md:gap-10">
        <div>
          <Link to="/" className="inline-flex items-start">
            <img
              src={docAtlasLogo}
              alt="DocAtlas logo"
              className="h-18 w-18 object-contain drop-shadow-[0_8px_14px_rgba(37,99,235,0.32)]"
            />
          </Link>
        </div>

        <div className="space-y-3">
          <p className="font-semibold text-sky-950">Company</p>
          <ul className="space-y-2">
            <li>
              <Link
                to="/features"
                className="text-sky-600 transition hover:text-sky-650"
              >
                Features
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className="text-sky-600 transition hover:text-sky-650"
              >
                About
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <p className="font-semibold text-sky-950">Contact</p>
          <p className="text-sky-600">team@docatlas.ai</p>
          <p className="max-w-sm text-xs leading-5 text-sky-600">
            Copyright (c) {currentYear} DocAtlas. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
