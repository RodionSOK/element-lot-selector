import { Routes, Route } from 'react-router-dom'
import { CatalogPage } from './pages/CatalogPage/CatalogPage'
import { LotDetailPage } from './pages/LotDetailPage/LotDetailPage'
import { AdminLoginPage } from './pages/AdminLoginPage/AdminLoginPage'
import { AdminPanelPage } from './pages/AdminPanelPage/AdminPanelPage'
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute'

export function App() {
  return (
    <Routes>
      <Route path="/" element={<CatalogPage />} />
      <Route path="/lots/:id" element={<LotDetailPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminPanelPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
