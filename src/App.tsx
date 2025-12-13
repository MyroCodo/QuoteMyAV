import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { ProtectedRoute } from './components/auth';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { Quotes } from './pages/Quotes';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { QuoteBuilder } from './pages/QuoteBuilder';
import { QuoteDetail } from './pages/QuoteDetail';
import { Settings } from './pages/Settings';
import { useAuthStore } from './stores/authStore';

function App() {
  const initialize = useAuthStore((state) => state.initialize);

  // Initialize auth state on app mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />

        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>

        {/* Protected routes */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/quotes" element={<Quotes />} />
          <Route path="/quotes/new" element={<QuoteBuilder />} />
          <Route path="/quotes/:id" element={<QuoteDetail />} />
          <Route path="/quotes/:id/edit" element={<QuoteBuilder />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
