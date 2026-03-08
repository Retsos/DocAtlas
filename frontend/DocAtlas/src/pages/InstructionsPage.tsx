export default function InstructionsPage() {
  return (
    <section className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Instructions</h1>
        <p className="text-sm text-muted-foreground">
          Guidance and usage steps for the DocAtlas platform.
        </p>
      </header>

      <div className="rounded-lg border bg-card p-4">
        <p className="text-sm">
          This page is now connected to routing at{" "}
          <span className="font-mono">/instructions</span>.
        </p>
      </div>
    </section>
  );
}
