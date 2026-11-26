import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import AppProvider from './providers/AppProvider.tsx'
import { isDev } from './libs/checkEnv.ts'
import ErrorBoundary from './components/ui/ErrorBoundary.tsx'
import { installAxiosCsrfHeader } from './libs/axiosCsrf'
import './i18n'

installAxiosCsrfHeader()

createRoot(document.getElementById(isDev ? 'root' : 'landing-page-builder')!).render(
    <ErrorBoundary
      fallback={
        <div className="w-full h-screen flex items-center justify-center bg-background text-foreground text-sm">
          Something went wrong. Please refresh the page.
        </div>
      }
    >
      <AppProvider>
        <App />
      </AppProvider>
    </ErrorBoundary>
)
