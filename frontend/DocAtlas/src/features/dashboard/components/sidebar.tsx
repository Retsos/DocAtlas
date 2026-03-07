import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, CalendarDays, Settings } from 'lucide-react'

import { useAuth } from '@/app/providers/auth-provider'
import { Button } from '@/components/ui/button'

const navItems = [
  { to: '/app/dashboard', label: 'Knowledge Base', icon: LayoutDashboard },
  { to: '/app/patients', label: 'Patients', icon: Users },
  { to: '/app/appointments', label: 'Appointments', icon: CalendarDays },
  { to: '/app/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const { user, logout } = useAuth()

  return (
    <aside className="flex w-64 flex-col border-r bg-background p-4">
      <div className="mb-6">
        <p className="text-lg font-semibold">DocAtlas Admin</p>
        <p className="text-xs text-muted-foreground">{user?.hospitalName ?? 'Hospital'}</p>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              ].join(' ')
            }
          >
            <Icon className="size-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t pt-4">
        <p className="mb-3 text-xs text-muted-foreground">{user?.email}</p>
        <Button variant="outline" className="w-full" onClick={logout}>
          Logout
        </Button>
      </div>
    </aside>
  )
}
