import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

type Language = 'el' | 'en'

type TranslationTree = {
  [key: string]: string | TranslationTree
}

type LanguageContextValue = {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
}

const STORAGE_KEY = 'docatlas_language'

const translations: Record<Language, TranslationTree> = {
  el: {
    website: {
      nav: {
        home: 'Αρχική',
        features: 'Λειτουργίες',
        about: 'Σχετικά',
        signIn: 'Σύνδεση',
      },
      home: {
        badge: 'Πλατφόρμα Γνώσης Νοσοκομείου με AI',
        title: 'Φέρτε κάθε έγγραφο του νοσοκομείου σας σε έναν αξιόπιστο AI βοηθό.',
        description:
          'Το DocAtlas οργανώνει τα εσωτερικά αρχεία, τα πρωτόκολλα και τους συνδέσμους σας ώστε το προσωπικό να λαμβάνει άμεσα απαντήσεις με παραπομπές, βασισμένες στα δικά σας δεδομένα.',
        getStarted: 'Ξεκινήστε',
        learnMore: 'Μάθετε περισσότερα',
        assistantTitle: 'Βοηθός DocAtlas',
        assistantSubtitle: 'Απαντήσεις βασισμένες στον οργανισμό σας',
        question: 'Ποιο είναι το ενημερωμένο πρωτόκολλο διαλογής για εγκεφαλικό στα επείγοντα;',
        answer:
          'Το πρωτόκολλο v3.2 προτείνει CT εντός 20 λεπτών και άμεση ενεργοποίηση νευρολογικής εκτίμησης μετά την απεικόνιση. Πηγή: Stroke-Protocol-2025.pdf',
      },
      footer: {
        description: 'Πλατφόρμα γνώσης με AI για ομάδες υγείας.',
        company: 'Εταιρεία',
        features: 'Λειτουργίες',
        about: 'Σχετικά',
        contact: 'Επικοινωνία',
        copyrightSuffix: 'Με επιφύλαξη παντός δικαιώματος.',
      },
      pages: {
        featuresTitle: 'Λειτουργίες',
        aboutTitle: 'Σχετικά',
      },
    },
    auth: {
      backToWebsite: 'Πίσω στην ιστοσελίδα',
      adminPlatform: 'Πλατφόρμα Διαχείρισης',
      heroTitle: 'Η γνώση του οργανισμού σας, πάντα διαθέσιμη.',
      heroDescription: 'AI βοηθός για νοσοκομεία βασισμένος στα δικά σας αρχεία, URLs και λειτουργικά έγγραφα.',
      heroBullets: {
        one: 'Εισαγωγή εγγράφων και RAG',
        two: 'Απαντήσεις προσαρμοσμένες στον οργανισμό',
        three: 'Απαντήσεις με παραπομπές πηγών',
        four: 'Έτοιμο για ασθενείς και προσωπικό',
      },
      headings: {
        login: 'Καλώς ήρθατε ξανά',
        register: 'Καταχωρήστε το νοσοκομείο σας',
      },
      subheadings: {
        login: 'Συνδεθείτε για να διαχειριστείτε τη βάση γνώσης και τις ρυθμίσεις σας.',
        register: 'Δημιουργήστε λογαριασμό διαχειριστή συνδεδεμένο με τον οργανισμό σας.',
      },
      tabs: {
        login: 'Σύνδεση',
        register: 'Εγγραφή',
      },
      labels: {
        hospitalName: 'Όνομα Νοσοκομείου',
        email: 'Email',
        password: 'Κωδικός',
      },
      placeholders: {
        hospitalName: 'π.χ. Υγεία Νοσοκομείο',
        email: 'admin@hospital.gr',
        password: '********',
      },
      buttons: {
        loading: 'Παρακαλώ περιμένετε...',
        login: 'Σύνδεση στο DocAtlas',
        register: 'Δημιουργία λογαριασμού νοσοκομείου',
      },
      errors: {
        hospitalNameRequired: 'Το όνομα νοσοκομείου είναι υποχρεωτικό.',
        permissionDenied: 'Οι κανόνες Firestore μπλόκαραν την ενέργεια. Ελέγξτε τις ρυθμίσεις της βάσης.',
        emailInUse: 'Αυτό το email χρησιμοποιείται ήδη.',
        invalidCredential: 'Μη έγκυρο email ή κωδικός.',
        generic: 'Κάτι πήγε στραβά. Προσπαθήστε ξανά.',
      },
    },
  },
  en: {
    website: {
      nav: {
        home: 'Home',
        features: 'Features',
        about: 'About',
        signIn: 'Sign in',
      },
      home: {
        badge: 'Hospital AI Knowledge Platform',
        title: 'Bring every hospital document into one reliable AI assistant.',
        description:
          'DocAtlas organizes your internal files, protocols and links so staff gets instant, cited answers grounded in your own institution data.',
        getStarted: 'Get Started',
        learnMore: 'Learn More',
        assistantTitle: 'DocAtlas Assistant',
        assistantSubtitle: 'Institution-grounded responses',
        question: 'What is the updated emergency stroke triage protocol?',
        answer:
          'Protocol v3.2 recommends CT within 20 minutes and immediate neurology consult activation after imaging. Source: Stroke-Protocol-2025.pdf',
      },
      footer: {
        description: 'AI knowledge platform for healthcare teams.',
        company: 'Company',
        features: 'Features',
        about: 'About',
        contact: 'Contact',
        copyrightSuffix: 'All rights reserved.',
      },
      pages: {
        featuresTitle: 'Features',
        aboutTitle: 'About',
      },
    },
    auth: {
      backToWebsite: 'Back to website',
      adminPlatform: 'Admin Platform',
      heroTitle: "Your institution's knowledge, always at hand.",
      heroDescription: 'AI assistant for hospitals grounded on your own files, URLs and operational docs.',
      heroBullets: {
        one: 'Document ingestion and RAG',
        two: 'Institution-specific answers',
        three: 'Source-cited responses',
        four: 'Patient and staff ready',
      },
      headings: {
        login: 'Welcome back',
        register: 'Register your hospital',
      },
      subheadings: {
        login: 'Sign in to manage your knowledge base and settings.',
        register: 'Create an admin account linked to your organization.',
      },
      tabs: {
        login: 'Sign in',
        register: 'Register',
      },
      labels: {
        hospitalName: 'Hospital Name',
        email: 'Email',
        password: 'Password',
      },
      placeholders: {
        hospitalName: 'e.g. Hygeia Hospital',
        email: 'admin@hospital.gr',
        password: '********',
      },
      buttons: {
        loading: 'Please wait...',
        login: 'Sign in to DocAtlas',
        register: 'Create hospital account',
      },
      errors: {
        hospitalNameRequired: 'Hospital name is required.',
        permissionDenied: 'Firestore rules blocked this action. Check your database rules.',
        emailInUse: 'This email is already in use.',
        invalidCredential: 'Invalid email or password.',
        generic: 'Something went wrong. Please try again.',
      },
    },
  },
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function detectInitialLanguage(): Language {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'el' || saved === 'en') {
    return saved
  }

  return navigator.language.toLowerCase().startsWith('el') ? 'el' : 'en'
}

function resolveText(tree: TranslationTree, key: string): string {
  const value = key.split('.').reduce<string | TranslationTree | undefined>((current, part) => {
    if (typeof current === 'string' || !current) {
      return undefined
    }
    return current[part]
  }, tree)

  return typeof value === 'string' ? value : key
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(detectInitialLanguage)

  function setLanguage(nextLanguage: Language) {
    setLanguageState(nextLanguage)
    localStorage.setItem(STORAGE_KEY, nextLanguage)
  }

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      t: (key: string) => resolveText(translations[language], key),
    }),
    [language],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)

  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }

  return context
}
