import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from '@/pages/LandingPage'
import DashboardPage from '@/pages/DashboardPage'
import LearnPage from '@/pages/LearnPage'
import ChatPage from '@/pages/ChatPage'
import ProfilePage from '@/pages/ProfilePage'
import AppShell from '@/components/layout/AppShell'
import { useTheme } from '@/hooks/useTheme'

export default function App() {
  const { theme } = useTheme()

  return (
    <div className={theme}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/app" element={<AppShell />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="learn" element={<LearnPage />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}
