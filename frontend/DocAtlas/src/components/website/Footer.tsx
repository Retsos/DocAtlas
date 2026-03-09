import { Link } from "react-router-dom";
import docAtlasLogo from "@/assets/DocAtlasLogo.png";
import { useLanguage } from "@/providers/LanguageProvider";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { language, setLanguage, t } = useLanguage();

  return (
    <footer className="relative border-t border-emerald-200 px-4 py-8 sm:px-5 sm:py-10 lg:px-10 xl:px-14">
      <div className="mx-auto grid w-full max-w-6xl items-start gap-8 text-sm sm:gap-6 md:grid-cols-4 md:gap-10">
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
            {t("website.footer.language")}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setLanguage("el")}
              className={[
                "rounded-full border px-3 py-1 text-xs font-semibold transition",
                language === "el"
                  ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                  : "border-emerald-200 text-emerald-700/80 hover:border-emerald-400",
              ].join(" ")}
            >
              Ελληνικά
            </button>
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={[
                "rounded-full border px-3 py-1 text-xs font-semibold transition",
                language === "en"
                  ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                  : "border-emerald-200 text-emerald-700/80 hover:border-emerald-400",
              ].join(" ")}
            >
              English
            </button>
          </div>
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
