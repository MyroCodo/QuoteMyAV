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
import { Checkout } from './pages/Checkout';
import { Plans } from './pages/Plans';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';
import { useAuthStore } from './stores/authStore';
import { ChatWidget } from './components/ChatWidget';

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
        <Route path="/checkout" element={<Checkout />} />

        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>

        {/* Public info pages */}
        <Route path="/plans" element={<Plans />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />

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

      {/* Global Chat Widget - Available on all pages */}
      <ChatWidget />
    </BrowserRouter>
  );
}

export default App;
