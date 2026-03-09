import { Link } from "react-router-dom";
import docAtlasLogo from "@/assets/DocAtlasLogo.png";
import { useLanguage } from "@/providers/LanguageProvider";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();

  return (
    <footer className="relative border-t border-emerald-200 px-4 py-8 sm:px-5 sm:py-10 lg:px-10 xl:px-14">
      <div className="mx-auto grid w-full max-w-6xl items-start gap-8 text-sm sm:gap-6 md:grid-cols-[auto_1fr_1fr_1.2fr] md:gap-10">
        <div>
          <Link to="/" className="inline-flex items-start">
            <img
              src={docAtlasLogo}
              alt="DocAtlas logo"
              className="h-12 w-12 object-contain drop-shadow-[0_8px_14px_rgba(5,150,105,0.32)]"
            />
          </Link>
        </div>

        <div className="space-y-3">
          <p className="font-semibold text-emerald-900/90">
            {t("website.footer.company")}
          </p>
          <ul className="space-y-2">
            <li>
              <Link
                to="/features"
                className="text-emerald-700/90 transition hover:text-emerald-600"
              >
                {t("website.footer.features")}
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className="text-emerald-700/90 transition hover:text-emerald-600"
              >
                {t("website.footer.about")}
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <p className="font-semibold text-emerald-900/90">
            {t("website.footer.resources")}
          </p>
          <ul className="space-y-2">
            <li>
              <Link
                to="/dashboard"
                className="text-emerald-700/90 transition hover:text-emerald-600"
              >
                {t("website.footer.knowledgeBase")}
              </Link>
            </li>
            <li>
              <Link
                to="/instructions"
                className="text-emerald-700/90 transition hover:text-emerald-600"
              >
                {t("website.footer.instructions")}
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <p className="font-semibold text-emerald-900/90">
            {t("website.footer.contact")}
          </p>
          <p className="text-emerald-700/90">team@docatlas.ai</p>
          <p className="max-w-sm text-xs leading-5 text-emerald-700/75">
            Copyright (c) {currentYear} DocAtlas.{" "}
            {t("website.footer.copyrightSuffix")}
          </p>
        </div>
      </div>
    </footer>
  );
}
