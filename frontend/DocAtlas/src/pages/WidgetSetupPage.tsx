import { useState } from "react";
import { Check, Copy, Loader2, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/AuthProvider";
import { useWebsiteUrlSettings } from "@/hooks/useWebsiteUrlSettings";

export default function WidgetSetupPage() {
  const { user } = useAuth();
  const tenantUid = user?.id ?? "YOUR_TENANT_UID";
  const [copied, setCopied] = useState(false);
  const {
    websiteUrl,
    savedWebsiteUrl,
    isSavingUrl,
    isLoadingUrl,
    urlStatus,
    setWebsiteUrl,
    saveWebsiteUrl,
  } = useWebsiteUrlSettings(user?.id);

  const embedSnippet = `<script src="https://chatbot-lac-one-96.vercel.app/widget.js" data-tenant-uid=${tenantUid} ></script>`;

  async function handleCopySnippet() {
    await navigator.clipboard.writeText(embedSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-sky-100 bg-white/90 p-6 shadow-[0_20px_45px_rgba(30,64,175,0.1)]">
        <p className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-900">
          <ShieldCheck className="size-3.5" />
          Production Setup Guide
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-sky-950">
          Embed DocAtlas Widget
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Follow this guide to install the DocAtlas widget and securely connect
          it to your institution knowledge base.
        </p>
      </header>

      <article className="rounded-xl border-2 border-sky-300 bg-gradient-to-br from-sky-50 via-white to-cyan-50 p-5 shadow-[0_12px_30px_rgba(14,116,144,0.12)]">
        <p className="inline-flex items-center rounded-full border border-sky-300 bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-sky-800">
          Most Important
        </p>
        <h2 className="mt-3 text-base font-semibold text-sky-950">
          Step 1: Set Website URL
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Enter the exact website where the widget will run. This URL is used
          for domain security checks.
        </p>
        <label className="mt-4 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
          Website address
        </label>
        {isLoadingUrl && (
          <div className="mt-2 inline-flex items-center gap-2 rounded-md border border-sky-100 bg-sky-50 px-3 py-2 text-xs text-slate-600">
            <Loader2 className="size-3.5 animate-spin" />
            Loading saved URL...
          </div>
        )}
        <input
          type="url"
          value={websiteUrl}
          onChange={(event) => setWebsiteUrl(event.target.value)}
          placeholder="https://www.yourhospital.org"
          className="mt-2 h-11 w-full rounded-md border border-sky-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
        />
        <div className="mt-3 flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-10 border-sky-300 cursor-pointer hover:text-white bg-sky-600 px-2 text-xs text-white transition hover:bg-sky-700 hover:border-sky-300 md:px-3 md:text-sm"
            disabled={isSavingUrl || isLoadingUrl}
            onClick={() => void saveWebsiteUrl()}
          >
            {isSavingUrl
              ? "Saving..."
              : savedWebsiteUrl
                ? "Update URL"
                : "Save URL"}
          </Button>
          {savedWebsiteUrl ? (
            <p className="text-xs text-slate-500">
              Current saved URL:{" "}
              <span className="font-mono">{savedWebsiteUrl}</span>
            </p>
          ) : (
            <p className="text-xs text-slate-500">No URL saved yet.</p>
          )}
        </div>
        {urlStatus ? (
          <p className="mt-2 text-sm text-slate-600">{urlStatus}</p>
        ) : null}
      </article>

      <article className="rounded-xl border border-sky-100 bg-white p-5">
        <h2 className="text-base font-semibold text-slate-900">
          Step 2: Insert the Script
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Copy the snippet and paste it into your website HTML, preferably
          before the closing <code>&lt;/body&gt;</code> tag.
        </p>
        <div className="mt-4 w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-700">
          <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-3">
            <p className="text-xs font-medium tracking-wide text-slate-400">
              HTML
            </p>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              onClick={() => void handleCopySnippet()}
              aria-label="Copy embed code"
            >
              {copied ? (
                <Check className="size-4" />
              ) : (
                <Copy className="size-4" />
              )}
            </Button>
          </div>

          <div className="overflow-x-auto bg-slate-800 p-4 font-mono text-xs leading-5 text-slate-300">
            <div className="min-w-[620px]">
              <div>
                <span className="text-pink-400">&lt;!doctype</span>{" "}
                <span className="text-white">html</span>
                <span className="text-pink-400">&gt;</span>
              </div>
              <div>
                <span className="text-pink-400">&lt;html</span>{" "}
                <span className="text-white">lang</span>=
                <span className="text-sky-300">"en"</span>
                <span className="text-pink-400">&gt;</span>
              </div>
              <div>
                <span className="text-pink-400">&lt;head&gt;</span>
              </div>
              <div className="pl-6">
                <span className="text-pink-400">&lt;meta</span>{" "}
                <span className="text-white">charset</span>=
                <span className="text-sky-300">"UTF-8"</span>{" "}
                <span className="text-pink-400">/&gt;</span>
              </div>
              <div className="pl-6">
                <span className="text-pink-400">&lt;meta</span>{" "}
                <span className="text-white">name</span>=
                <span className="text-sky-300">"viewport"</span>{" "}
                <span className="text-white">content</span>=
                <span className="text-sky-300">
                  "width=device-width, initial-scale=1.0"
                </span>{" "}
                <span className="text-pink-400">/&gt;</span>
              </div>
              <div>
                <span className="text-pink-400">&lt;/head&gt;</span>
              </div>
              <div>
                <span className="text-pink-400">&lt;body&gt;</span>
              </div>
              <div className="pl-6 text-slate-500">
                <span>&lt;!-- Your page content --&gt;</span>
              </div>
              <div className="relative bg-cyan-200/20 pl-6 before:absolute before:bottom-0 before:left-0 before:top-0 before:w-0.5 before:bg-cyan-400">
                <span className="text-pink-400">&lt;script</span>{" "}
                <span className="text-white">src</span>=
                <span className="text-sky-300">
                  "https://chatbot-lac-one-96.vercel.app/widget.js"
                </span>{" "}
                <span className="text-white">data-tenant-uid</span>=
                <span className="text-sky-300">"{tenantUid}"</span>{" "}
                <span className="text-pink-400">&gt;&lt;/script&gt;</span>
              </div>
              <div>
                <span className="text-pink-400">&lt;/body&gt;</span>
              </div>
              <div>
                <span className="text-pink-400">&lt;/html&gt;</span>
              </div>
            </div>
          </div>
        </div>
      </article>

      <article className="rounded-xl border border-sky-100 bg-white p-5">
        <h2 className="text-base font-semibold text-slate-900">
          Step 3: Verify Installation
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Open your website and confirm the widget appears correctly on the
          page.
        </p>
        <p className="mt-2 text-sm text-slate-600">
          If it does not load, verify that:
          <span className="font-mono"> website URL</span> is saved in Step 1 and
          the script was pasted before the <code>&lt;/body&gt;</code> tag in
          Step 2.
        </p>
      </article>
    </section>
  );
}
