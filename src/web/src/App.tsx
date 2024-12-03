import { AuthProvider, useAuth } from '@/auth/AuthContext';
import React, { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import { FontScaleProvider } from './context/FontScaleContext';
import { ThemeProvider } from './context/ThemeContext';
import AdminPanel from './pages/AdminPanel';
import EditWorkflow from './pages/EditWorkflow';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Services from './pages/Services';
import Settings from './pages/Settings';
import Workflows from './pages/Workflows';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/register" replace />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/" replace />;
}

function Logout() {
  const { logout } = useAuth();
  logout();
  return <Navigate to="/login" replace />;
}

function LoginSuccess() {
  const { login } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token)
      login(token);
  }, [location]);

  return <Navigate to="/" replace />;
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <FontScaleProvider>
          <BrowserRouter>
            <Routes>
              <Route
                path="/login"
                element={
                  <Login />
                }
              />

              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                }
              />

              <Route
                path="/logout"
                element={
                  <ProtectedRoute>
                    <Logout />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Home />
                    </Layout>
                  </ProtectedRoute>
                }
              ></Route>

              <Route
                path="/users"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <AdminPanel />
                    </Layout>
                  </ProtectedRoute>
                }
              ></Route>

              <Route
                path="/services"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Services />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Settings />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/services"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Services />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/workflows"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Workflows />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path='/workflows/:id'
                element={
                  <ProtectedRoute>
                    <Layout header={false} padding={false}>
                      <EditWorkflow />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path='/login-success'
                element={
                  <LoginSuccess />
                }
              />
            </Routes>
          </BrowserRouter>
        </FontScaleProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
