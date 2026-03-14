import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css' // Make sure this path is correct
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from './lib/AuthContext'
import { DatabaseProvider } from './lib/DatabaseContext'
import { ThemeProvider } from 'next-themes'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <DatabaseProvider>
          <App />
          <Toaster />
        </DatabaseProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
)