import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/AuthProvider";

export default function InstructionsPage() {
  const { user } = useAuth();
  const tenantUid = user?.id ?? "YOUR_TENANT_UID_FROM_STEP_1";
  const [copied, setCopied] = useState(false);

  const embedSnippet = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>My Website</title>
  <link rel="stylesheet" href="https://[YOUR_VERCEL_CDN_URL]/widget.css" />
</head>
<body>
  <!-- Your page content -->

  <script src="https://[YOUR_VERCEL_CDN_URL]/widget.js" data-tenant-uid="${tenantUid}"></script>
</body>
</html>`;

  async function handleCopySnippet() {
    await navigator.clipboard.writeText(embedSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Instructions</h1>
        <p className="text-sm text-muted-foreground">
          Follow these steps to embed the DocAtlas widget on your website.
        </p>
      </header>

      <article className="rounded-lg border bg-card p-4">
        <h2 className="text-base font-semibold">
          Step 1: Your Key (Tenant ID)
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Your organization unique identifier is:
        </p>
        <p className="mt-2 rounded-md bg-muted px-3 py-2 font-mono text-sm break-all">
          {tenantUid}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Do not lose it and do not change it. Without this key, the assistant
          cannot access your organization documents.
        </p>
      </article>

      <article className="rounded-lg border bg-card p-4">
        <h2 className="text-base font-semibold">Step 2: Insert the Code</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Copy the highlited code below and paste it into your website HTML.
          Ideally, place it right before the closing <code>&lt;/body&gt;</code>{" "}
          tag.
        </p>
        <div className="mt-4 w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-700">
          <div className="flex items-center justify-between border-b bg-gray-900 border-slate-800 px-4 py-3">
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

          <div className="overflow-x-auto bg-gray-800 p-4 font-mono text-xs leading-5 text-slate-300">
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
                  "https://doc-atlas-s2zi.vercel.app/widget.js"
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

      <article className="rounded-lg border bg-card p-4">
        <h2 className="text-base font-semibold">
          Step 3: Register Your Domain (Security)
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          For security reasons, our server rejects requests coming from unknown
          websites.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Make sure your website domain (for example,{" "}
          <span className="font-mono">www.ahepa.gr</span>) is correctly
          registered in your DocAtlas Admin Panel profile settings. If the
          script is placed on an unregistered domain, access will be blocked
          automatically.
        </p>
      </article>
    </section>
  );
}
