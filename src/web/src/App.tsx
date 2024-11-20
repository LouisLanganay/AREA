import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import { AuthProvider, useAuth } from '@/auth/AuthContext'
import Home from './pages/Home'
import Services from './pages/Services'
import Workflows from './pages/Workflows'
import AdminPanel from './pages/AdminPanel'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to='/register' replace />
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  return !isAuthenticated ? children : <Navigate to='/' replace />
}

function Logout() {
  const { logout } = useAuth();
  logout();
  return <Navigate to='/login' replace />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/login' element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />

          <Route path='/register' element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />

          <Route path='/logout' element={
            <ProtectedRoute>
              <Logout />
            </ProtectedRoute>
          } />

          <Route path='/' element={
            <ProtectedRoute>
              <Layout>
                <Home />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path='/services' element={
            <ProtectedRoute>
              <Layout>
                <Services />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path='/workflows' element={
            <ProtectedRoute>
              <Layout>
                <Workflows />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path='/users' element={
            <ProtectedRoute>
              <Layout>
                <AdminPanel />
              </Layout>
            </ProtectedRoute>
          }>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App