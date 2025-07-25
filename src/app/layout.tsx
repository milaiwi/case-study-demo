// app/layout.tsx
import './globals.css'
import { NavBar } from './components/Navbar/NavBar'
import { AuthProvider } from '@/lib/auth-context'
import RoleIndicator from './components/RoleIndicator'
import type { ReactNode } from 'react'

export const metadata = {
  title: 'Case Study App',
  description: 'My converted CRA app',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="flex flex-col h-screen">
        <AuthProvider>
          <NavBar />
          <RoleIndicator />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
