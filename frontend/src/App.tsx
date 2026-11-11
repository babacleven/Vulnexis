import React, { useState, useEffect } from 'react';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { TermsPage } from './pages/TermsPage';
import { AppLayout } from './components/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { TargetsPage } from './pages/TargetsPage';
import { TargetDetailPage } from './pages/TargetDetailPage';
import { ScansPage } from './pages/ScansPage';
import { NewScanPage } from './pages/NewScanPage';
import { ScanDetailPage } from './pages/ScanDetailPage';
import { CreditsPage } from './pages/CreditsPage';
import { AgentPage } from './pages/AgentPage';
import { ParrainagePage } from './pages/ParrainagePage';
import { SettingsPage } from './pages/SettingsPage';

function Router() {
  const { user, loading } = useAuth();
  const [currentPath, setCurrentPath] = useState(window.location.pathname || '/');

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path.split('?')[0]);
    window.scrollTo(0, 0);
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-white">
        <span
          role="status"
          aria-label="Chargement"
          className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-kx-accent border-t-transparent"
        />
      </div>
    );
  }

  // Route matches
  if (currentPath === '/') {
    return <LandingPage onNavigate={navigate} authed={!!user} />;
  }

  if (currentPath === '/terms') {
    return <TermsPage onNavigate={navigate} />;
  }

  if (currentPath === '/login') {
    return <AuthPage mode="login" onNavigate={navigate} />;
  }

  if (currentPath === '/register') {
    return <AuthPage mode="register" onNavigate={navigate} />;
  }

  if (currentPath === '/admin/login') {
    return <AuthPage mode="admin" onNavigate={navigate} />;
  }

  if (currentPath === '/forgot-password') {
    return <AuthPage mode="forgot" onNavigate={navigate} />;
  }

  // Protected Routes - If no user, redirect to login with next param
  if (!user) {
    return <AuthPage mode="login" onNavigate={navigate} />;
  }

  // Inside Protected App Shell
  let pageContent = <DashboardPage onNavigate={navigate} />;

  if (currentPath === '/dashboard') {
    pageContent = <DashboardPage onNavigate={navigate} />;
  } else if (currentPath === '/targets') {
    pageContent = <TargetsPage onNavigate={navigate} />;
  } else if (currentPath.startsWith('/targets/')) {
    const targetId = currentPath.replace('/targets/', '');
    pageContent = <TargetDetailPage targetId={targetId} onNavigate={navigate} />;
  } else if (currentPath === '/scans') {
    pageContent = <ScansPage onNavigate={navigate} />;
  } else if (currentPath === '/scans/new') {
    const urlParams = new URLSearchParams(window.location.search);
    const targetParam = urlParams.get('target') || undefined;
    pageContent = <NewScanPage initialTargetId={targetParam} onNavigate={navigate} />;
  } else if (currentPath.startsWith('/scans/')) {
    const scanId = currentPath.replace('/scans/', '');
    pageContent = <ScanDetailPage scanId={scanId} onNavigate={navigate} />;
  } else if (currentPath === '/credits') {
    pageContent = <CreditsPage />;
  } else if (currentPath === '/agent') {
    pageContent = <AgentPage onNavigate={navigate} />;
  } else if (currentPath === '/parrainage') {
    pageContent = <ParrainagePage onNavigate={navigate} />;
  } else if (currentPath === '/settings') {
    pageContent = <SettingsPage onNavigate={navigate} />;
  }

  return (
    <AppLayout currentPath={currentPath} onNavigate={navigate}>
      {pageContent}
    </AppLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}
