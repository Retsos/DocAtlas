import { Link } from "react-router-dom";

import { useLanguage } from "@/providers/LanguageProvider";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();

  return (
    <footer className="relative border-t border-emerald-200 px-4 py-8 sm:px-5 sm:py-10">
      <div className="pointer-events-none absolute inset-0" />
      <div className="relative mx-auto grid w-full max-w-6xl gap-8 text-sm sm:gap-6 md:grid-cols-3">
        <div>
          <p className="text-base font-semibold text-emerald-600">DocAtlas</p>
          <p className="mt-2 max-w-sm leading-6 text-emerald-600/90">
            {t("website.footer.description")}
          </p>
        </div>

        <div>
          <p className="font-semibold text-emerald-600">
            {t("website.footer.company")}
          </p>
          <ul className="mt-2 space-y-1">
            <li>
              <Link
                to="/features"
                className="text-emerald-600/90 hover:emerald-600"
              >
                {t("website.footer.features")}
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className="text-emerald-600/90 hover:emerald-600"
              >
                {t("website.footer.about")}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="font-semibold text-emerald-600">
            {t("website.footer.contact")}
          </p>
          <p className="mt-2 text-emerald-600/90">team@docatlas.ai</p>
          <p className="mt-3 max-w-sm text-xs leading-5 text-emerald-600/75">
            Copyright (c) {currentYear} DocAtlas.{" "}
            {t("website.footer.copyrightSuffix")}
          </p>
        </div>
      </div>
    </footer>
  );
}
