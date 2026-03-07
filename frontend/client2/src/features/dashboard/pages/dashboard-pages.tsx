function PageShell({ title, description }: { title: string; description: string }) {
  return (
    <section className="space-y-2 rounded-xl border bg-card p-6 shadow-sm">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="text-sm text-muted-foreground">{description}</p>
    </section>
  )
}

export function PatientsPage() {
  return (
    <PageShell
      title="Patients"
      description="Patient management table/list will be added here."
    />
  )
}

export function AppointmentsPage() {
  return (
    <PageShell
      title="Appointments"
      description="Calendar and appointment workflows will be added here."
    />
  )
}

export function SettingsPage() {
  return (
    <PageShell
      title="Settings"
      description="Organization settings, roles and permissions will be added here."
    />
  )
}
