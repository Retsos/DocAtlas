import { AlertTriangle, ArrowLeft, Home } from "lucide-react";
import {
  isRouteErrorResponse,
  useNavigate,
  useRouteError,
} from "react-router-dom";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/AuthProvider";

type ErrorDetails = {
  status?: number;
  statusText?: string;
  message: string;
};

function normalizeError(error: unknown): ErrorDetails {
  if (isRouteErrorResponse(error)) {
    return {
      status: error.status,
      statusText: error.statusText,
      message:
        typeof error.data === "string"
          ? error.data
          : error.statusText || "Something went wrong.",
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message || "Unexpected application error.",
    };
  }

  return {
    message: "We couldn't load this page.",
  };
}

export default function ErrorPage() {
  const routeError = useRouteError();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const details = normalizeError(routeError);
  const backTarget = isAuthenticated ? "/dashboard" : "/";
  const backLabel = isAuthenticated ? "Back to Dashboard" : "Back to Home";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <section className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 inline-flex size-12 items-center justify-center rounded-full bg-red-50 text-red-600">
          <AlertTriangle className="size-6" />
        </div>

        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          {details.status ? `Error ${details.status}` : "Unexpected Error"}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          {details.status === 404 ? "Page not found" : "Something went wrong"}
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          {details.message}
          {details.statusText ? ` (${details.statusText})` : ""}
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button
            className="bg-slate-900 text-white hover:bg-slate-800"
            onClick={() => navigate(backTarget)}
          >
            <ArrowLeft className="mr-2 size-4" />
            {backLabel}
          </Button>
          <Button variant="outline" onClick={() => navigate("/")}>
            <Home className="mr-2 size-4" />
            Home
          </Button>
        </div>
      </section>
    </main>
  );
}
