import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/layout/Layout'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import IndividualDashboard from './pages/individual/Dashboard'
import IndividualBacktestPage from './pages/individual/BacktestPage'
import IndividualSimulationPage from './pages/individual/SimulationPage'
import IndividualRegimePage from './pages/individual/RegimePage'
import IndividualStrategyPage from './pages/individual/StrategyPage'
import IndividualPortfolioPage from './pages/individual/PortfolioPage'
import IndividualHistoryPage from './pages/individual/HistoryPage'
import IndividualProfilePage from './pages/individual/ProfilePage'
import StudentDashboard from './pages/student/Dashboard'
import OrganizationDashboard from './pages/organization/Dashboard'
import RequireAuth from './components/ui/RequireAuth'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/individual/*"
          element={
            <RequireAuth userType="individual">
              <Routes>
                <Route path="dashboard" element={<IndividualDashboard />} />
                <Route path="backtest" element={<IndividualBacktestPage />} />
                <Route path="simulation" element={<IndividualSimulationPage />} />
                <Route path="regime" element={<IndividualRegimePage />} />
                <Route path="strategy" element={<IndividualStrategyPage />} />
                <Route path="portfolio" element={<IndividualPortfolioPage />} />
                <Route path="history" element={<IndividualHistoryPage />} />
                <Route path="profile" element={<IndividualProfilePage />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </RequireAuth>
          }
        />

        <Route
          path="/student/*"
          element={
            <RequireAuth userType="student">
              <Routes>
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </RequireAuth>
          }
        />

        <Route
          path="/organization/*"
          element={
            <RequireAuth userType="organization">
              <Routes>
                <Route path="dashboard" element={<OrganizationDashboard />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </RequireAuth>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}
