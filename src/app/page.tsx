'use client'

// app/page.tsx
import { useAuth } from '@/lib/auth-context'
import HomePage from "./components/Pages/HomePage"
import TaskSubmissionPage from "./components/Pages/TaskSubmissionPage"
import TaskEmployeeDashboard from "./components/Pages/TaskEmployeeDashboard"

export default function Home() {
  const { isAuthenticated, userRole } = useAuth()

  if (isAuthenticated) {
    if (userRole === 'employee') {
      return <TaskEmployeeDashboard />
    } else {
      return <TaskSubmissionPage />
    }
  }

  return <HomePage />
}
