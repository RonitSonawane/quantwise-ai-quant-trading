import { Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/layout/Layout'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import StudentShell from './components/layout/StudentShell'
import OrganizationShell from './components/layout/OrganizationShell'
import IndividualDashboard from './pages/individual/Dashboard'
import IndividualBacktestPage from './pages/individual/BacktestPage'
import IndividualSimulationPage from './pages/individual/SimulationPage'
import IndividualRegimePage from './pages/individual/RegimePage'
import IndividualStrategyPage from './pages/individual/StrategyPage'
import IndividualPortfolioPage from './pages/individual/PortfolioPage'
import IndividualHistoryPage from './pages/individual/HistoryPage'
import IndividualProfilePage from './pages/individual/ProfilePage'
import IndividualPaperTradingPage from './pages/individual/PaperTradingPage'
import IndividualPaperTradingHistory from './pages/individual/PaperTradingHistory'
import IndividualPaperTradingAnalytics from './pages/individual/PaperTradingAnalytics'
import StudentDashboard from './pages/student/Dashboard'
import StudentLearnPage from './pages/student/LearnPage'
import StudentResearchLabPage from './pages/student/ResearchLabPage'
import StudentExperimentsPage from './pages/student/ExperimentsPage'
import StudentStrategiesPage from './pages/student/StrategiesPage'
import OrganizationDashboard from './pages/organization/Dashboard'
import OrganizationAnalyticsPage from './pages/organization/AnalyticsPage'
import OrganizationAPIAccessPage from './pages/organization/APIAccessPage'
import OrganizationBulkBacktestPage from './pages/organization/BulkBacktestPage'
import OrganizationTeamPage from './pages/organization/TeamPage'
import OrganizationExportPage from './pages/organization/ExportPage'
import OrganizationRiskReportPage from './pages/organization/RiskReportPage'
import RequireAuth from './components/ui/RequireAuth'

export default function App() {
  return (
    <Layout>
      <Toaster position="top-right" toastOptions={{
        style: {
          background: '#12121A',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.1)'
        }
      }} />
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
                <Route path="paper-trading" element={<IndividualPaperTradingPage />} />
                <Route path="paper-trading/history" element={<IndividualPaperTradingHistory />} />
                <Route path="paper-trading/analytics" element={<IndividualPaperTradingAnalytics />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </RequireAuth>
          }
        />

        <Route
          path="/student"
          element={
            <RequireAuth userType="student">
              <StudentShell />
            </RequireAuth>
          }
        >
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="learn" element={<StudentLearnPage />} />
          <Route path="research-lab" element={<StudentResearchLabPage />} />
          <Route path="experiments" element={<StudentExperimentsPage />} />
          <Route path="strategies" element={<StudentStrategiesPage />} />
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>

        <Route
          path="/organization"
          element={
            <RequireAuth userType="organization">
              <OrganizationShell />
            </RequireAuth>
          }
        >
          <Route path="dashboard" element={<OrganizationDashboard />} />
          <Route path="analytics" element={<OrganizationAnalyticsPage />} />
          <Route path="api-access" element={<OrganizationAPIAccessPage />} />
          <Route path="bulk-backtest" element={<OrganizationBulkBacktestPage />} />
          <Route path="risk-report" element={<OrganizationRiskReportPage />} />
          <Route path="team" element={<OrganizationTeamPage />} />
          <Route path="export" element={<OrganizationExportPage />} />
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}
