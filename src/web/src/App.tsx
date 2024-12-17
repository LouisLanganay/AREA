import { AuthProvider, useAuth } from '@/auth/AuthContext';
import React, { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import { FontScaleProvider } from './context/FontScaleContext';
import { ThemeProvider } from './context/ThemeContext';
import AdminPanel from './pages/AdminPanel';
import EditWorkflow from './pages/EditWorkflow';
import Home from './pages/Home';
import Register from './pages/Register';
import Services from './pages/Services';
import Settings from './pages/Settings';
import Workflows from './pages/Workflows';
import ResetPassword from './pages/ResetPassword';
import ForgotPassword from './pages/ForgotPassword';
import Cookies from 'js-cookie';
import { discordOAuth, googleOAuth } from './api/Auth';
import Login from './pages/Login';
import ClientAPK from './pages/ClientAPK';
import Loading from './pages/Loading';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/register" replace />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/workflows" replace />;
}

function Logout() {
  const { logout } = useAuth();
  logout();
  return <Navigate to="/login" replace />;
}

function LoginSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const provider = Cookies.get('oauth_provider');
  const code = params.get('code');
  const { login } = useAuth();

  useEffect(() => {
    if (!code) return;

    const handleGoogle = async () => {
      try {
        const response = await googleOAuth(code);
        await processLogin(response.access_token);
      } catch (error) {
        console.error("Error authenticating with Google", error);
        navigate('/login');
      }
    };

    const handleDiscord = async () => {
      try {
        const response = await discordOAuth(code);
        await processLogin(response.access_token);
      } catch (error) {
        console.error("Error authenticating with Discord", error);
        navigate('/login');
      }
    };

    const processLogin = async (token: string) => {
      Cookies.remove('oauth_provider');
      if (token) {
        await login(token);
        navigate('/workflows');
      }
    };

    switch (provider) {
    case 'Google':
      handleGoogle();
      break;
    case 'Discord':
      handleDiscord();
      break;
    default:
      break;
    }
  }, [location]);

  return <Loading />;
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
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />

              <Route
                path="/register"
                element={
                  <Register />
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
                  <Home />
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

              <Route
                path='/forgot-password'
                element={
                  <ForgotPassword />
                }
              />

              <Route
                path='/reset-password'
                element={
                  <ResetPassword />
                }
              />

              <Route
                path='/client.apk'
                element={
                  <ClientAPK />
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
