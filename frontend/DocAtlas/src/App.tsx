import { AppRouter } from '@/app/app-router'
import { AuthProvider } from '@/app/providers/auth-provider'

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  )
}

export default App
