import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css' // Make sure this path is correct
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from './lib/AuthContext'
import { DatabaseProvider } from './lib/DatabaseContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <DatabaseProvider>
        <App />
        <Toaster />
      </DatabaseProvider>
    </AuthProvider>
  </React.StrictMode>,
)