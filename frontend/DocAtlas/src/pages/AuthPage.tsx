import { useState, type FormEvent } from "react";
import { FirebaseError } from "firebase/app";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "@/providers/AuthProvider";
import { useLanguage } from "@/providers/LanguageProvider";
import docAtlasLogo from "@/assets/DocAtlasLogo.png";

type AuthMode = "login" | "register";

function InputField({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required = true,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-900/80 sm:text-xs"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="h-11 w-full rounded-lg border border-emerald-100 bg-emerald-50/40 px-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-300/30 sm:h-12 sm:text-base"
      />
    </div>
  );
}

export function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [hospitalName, setHospitalName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { isAuthenticated, login, registerHospital } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo =
    (location.state as { from?: { pathname?: string } } | undefined)?.from
      ?.pathname ?? "/dashboard";

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      if (mode === "login") {
        await login({ email: email.trim(), password });
      } else {
        if (!hospitalName.trim()) {
          setErrorMessage(t("auth.errors.hospitalNameRequired"));
          return;
        }

        await registerHospital({
          hospitalName: hospitalName.trim(),
          email: email.trim(),
          password,
        });
      }

      navigate(redirectTo, { replace: true });
    } catch (error) {
      if (error instanceof FirebaseError) {
        if (error.code === "permission-denied") {
          setErrorMessage(t("auth.errors.permissionDenied"));
        } else if (error.code === "auth/email-already-in-use") {
          setErrorMessage(t("auth.errors.emailInUse"));
        } else if (error.code === "auth/invalid-credential") {
          setErrorMessage(t("auth.errors.invalidCredential"));
        } else {
          setErrorMessage(error.message);
        }
      } else {
        setErrorMessage(t("auth.errors.generic"));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative min-h-dvh overflow-y-auto bg-stone-100 bg-[radial-gradient(ellipse_80%_60%_at_70%_-10%,rgba(134,239,172,0.25)_0%,transparent_60%),radial-gradient(ellipse_50%_40%_at_5%_90%,rgba(147,197,253,0.2)_0%,transparent_55%)] p-4 sm:p-6 md:p-8">
      <div className="mx-auto mt-2 w-full max-w-7xl sm:mt-4 md:mt-6">
        <Link
          to="/"
          className="mb-5 inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-emerald-900 shadow-sm ring-1 ring-emerald-100 transition hover:bg-white sm:mb-8 sm:px-4 sm:py-2.5 sm:text-base"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="size-4"
            aria-hidden="true"
          >
            <path
              d="M15 18l-6-6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>{t("auth.backToWebsite")}</span>
        </Link>
      </div>

      <div className="mx-auto grid w-full max-w-7xl overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_24px_64px_rgba(0,0,0,0.08)] md:max-h-[calc(100dvh-9.5rem)] md:min-h-0 md:grid-cols-2">
        <aside className="relative flex flex-col items-center justify-center gap-4 overflow-y-auto bg-emerald-950 px-6 py-10 text-center text-emerald-50 sm:px-8 sm:py-12 md:gap-3 md:px-8 md:py-8 lg:px-12 lg:py-12">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:40px_40px]" />

          <div className="relative flex justify-center">
            <img
              src={docAtlasLogo}
              alt="DocAtlas logo"
              className="size-28 object-contain sm:size-36 md:size-44 lg:size-56 xl:size-64"
            />
          </div>

          <div className="relative space-y-3 md:space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300 sm:text-sm sm:tracking-[0.2em]">
              {t("auth.adminPlatform")}
            </p>
            <h2 className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl md:text-4xl">
              {t("auth.heroTitle")}
            </h2>
            <p className="mx-auto max-w-sm text-sm leading-6 text-emerald-100/75 sm:text-base sm:leading-7">
              {t("auth.heroDescription")}
            </p>
          </div>
        </aside>

        <section className="flex items-center justify-center overflow-y-auto p-5 sm:p-7 md:p-8 lg:p-10">
          <div className="w-full max-w-xl space-y-5 text-center sm:space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                {mode === "login"
                  ? t("auth.headings.login")
                  : t("auth.headings.register")}
              </h1>
              <p className="text-sm text-slate-500 sm:text-base">
                {mode === "login"
                  ? t("auth.subheadings.login")
                  : t("auth.subheadings.register")}
              </p>
            </div>

            <div className="mb-5 grid grid-cols-2 rounded-lg bg-slate-100 p-1 sm:mb-6">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setErrorMessage("");
                }}
                className={[
                  "rounded-md px-3 py-2 text-sm font-medium transition sm:py-2.5 sm:text-base",
                  mode === "login"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800",
                ].join(" ")}
              >
                {t("auth.tabs.login")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setErrorMessage("");
                }}
                className={[
                  "rounded-md px-3 py-2 text-sm font-medium transition sm:py-2.5 sm:text-base",
                  mode === "register"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800",
                ].join(" ")}
              >
                {t("auth.tabs.register")}
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-4 text-left">
              {mode === "register" && (
                <InputField
                  id="hospital-name"
                  label={t("auth.labels.hospitalName")}
                  value={hospitalName}
                  onChange={setHospitalName}
                  placeholder={t("auth.placeholders.hospitalName")}
                />
              )}

              <InputField
                id="email"
                label={t("auth.labels.email")}
                type="email"
                value={email}
                onChange={setEmail}
                placeholder={t("auth.placeholders.email")}
              />

              <InputField
                id="password"
                label={t("auth.labels.password")}
                type="password"
                value={password}
                onChange={setPassword}
                placeholder={t("auth.placeholders.password")}
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="h-11 w-full rounded-lg bg-emerald-950 text-sm font-semibold text-emerald-50 transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60 sm:h-12 sm:text-base"
              >
                {isSubmitting
                  ? t("auth.buttons.loading")
                  : mode === "login"
                    ? t("auth.buttons.login")
                    : t("auth.buttons.register")}
              </button>

              {errorMessage && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {errorMessage}
                </p>
              )}
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
