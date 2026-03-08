import { AppRouter } from '@/app/app-router'
import { AuthProvider } from '@/app/providers/auth-provider'
import { LanguageProvider } from '@/app/providers/language-provider'

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </LanguageProvider>
  )
}

export default App
