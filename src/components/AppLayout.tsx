import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Logo,
  IconHome,
  IconGlobe,
  IconTarget,
  IconCredits,
  IconRobot,
  IconGift,
  IconUser,
  IconBell,
  IconMenu,
  IconLogout,
  IconPlus,
} from './Icons';
import { NotificationItem } from '../types';

interface AppLayoutProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  children: React.ReactNode;
}

export function AppLayout({ currentPath, onNavigate, children }: AppLayoutProps) {
  const { user, creditsData, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [runningScansCount, setRunningScansCount] = useState(0);

  const fetchNotifs = async () => {
    try {
      const res = await fetch('/api/k/notifications/me');
      if (res.ok) {
        const json = await res.json();
        if (json.data?.items) {
          setNotifications(json.data.items);
          setUnreadCount(json.data.items.filter((n: NotificationItem) => !n.read).length);
        }
      }
      const countRes = await fetch('/api/k/notifications/me/unread-count');
      if (countRes.ok) {
        const cJson = await countRes.json();
        setUnreadCount(cJson.data?.count || 0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const checkRunningScans = async () => {
    try {
      const res = await fetch('/api/k/scans?status=running');
      if (res.ok) {
        const json = await res.json();
        setRunningScansCount(json.data?.total || 0);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchNotifs();
    checkRunningScans();
    const interval = setInterval(() => {
      fetchNotifs();
      checkRunningScans();
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    await fetch('/api/k/notifications/read-all', { method: 'POST' }).catch(() => null);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const navLinks = [
    { href: '/dashboard', label: 'Vue d’ensemble', icon: IconHome },
    { href: '/targets', label: 'Mes applications', icon: IconGlobe },
    { href: '/scans', label: 'Scans', icon: IconTarget },
    { href: '/credits', label: 'Crédits & offres', icon: IconCredits },
    { href: '/agent', label: 'Agent Kortex', icon: IconRobot },
    { href: '/parrainage', label: 'Parrainage', icon: IconGift },
    { href: '/settings', label: 'Compte', icon: IconUser },
  ];

  const adminLinks = [
    { href: '/admin', label: 'Tableau de bord admin', icon: IconHome },
    { href: '/admin/audit', label: 'Audit de domaine', icon: IconTarget },
    { href: '/admin/requests', label: 'Demandes d’audit', icon: IconTarget },
    { href: '/admin/users', label: 'Utilisateurs', icon: IconUser },
    { href: '/admin/credits', label: 'Crédits & codes', icon: IconCredits },
  ];

  return (
    <div className="flex min-h-screen bg-kx-bg text-kx-text">
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-kx-border bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center px-6 border-b border-kx-border">
          <button
            onClick={() => {
              onNavigate('/dashboard');
              setMobileMenuOpen(false);
            }}
            className="text-left"
          >
            <Logo size="md" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <nav className="space-y-1">
            {navLinks.map((item) => {
              const active = currentPath === item.href || (item.href !== '/dashboard' && currentPath.startsWith(item.href));
              const Icon = item.icon;
              return (
                <button
                  key={item.href}
                  onClick={() => {
                    onNavigate(item.href);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? 'bg-kx-navy text-white shadow-xs'
                      : 'text-kx-muted hover:bg-kx-panel2 hover:text-black'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${active ? 'text-white' : 'text-kx-muted'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Admin section if is_admin */}
          {user?.is_admin && (
            <div className="pt-4 border-t border-kx-border">
              <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-kx-muted">
                Console Opérateur
              </p>
              <nav className="space-y-1">
                {adminLinks.map((item) => {
                  const active = currentPath === item.href;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.href}
                      onClick={() => {
                        onNavigate(item.href);
                        setMobileMenuOpen(false);
                      }}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium transition ${
                        active
                          ? 'bg-kx-navy text-white'
                          : 'text-kx-muted hover:bg-kx-panel2 hover:text-black'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          )}
        </div>

        {/* Sidebar Footer: Credits & User info */}
        <div className="p-4 border-t border-kx-border space-y-3">
          <div
            onClick={() => {
              onNavigate('/credits');
              setMobileMenuOpen(false);
            }}
            className="cursor-pointer rounded-2xl border border-kx-border bg-kx-panel2 p-3 hover:border-black/30 transition"
          >
            <div className="flex items-center justify-between text-xs text-kx-muted">
              <span>Solde disponible</span>
              <span className="font-semibold text-black">
                {creditsData?.free_scans || user?.free_scans || 0} scans offerts
              </span>
            </div>
            <div className="mt-1.5 flex items-baseline justify-between">
              <span className="font-display text-xl font-bold text-black">
                {creditsData?.credits ?? user?.credits ?? 0}{' '}
                <span className="text-xs font-normal text-kx-muted">crédits</span>
              </span>
              <span className="text-xs font-semibold text-kx-teal hover:underline">
                Recharger
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between px-1 text-xs text-kx-muted">
            <span className="truncate max-w-[130px] font-mono">{user?.email}</span>
            <button
              onClick={() => {
                logout();
                onNavigate('/login');
              }}
              className="text-kx-muted hover:text-red-600 transition"
              title="Se déconnecter"
            >
              <IconLogout className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-kx-border bg-white px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="grid h-9 w-9 place-items-center rounded-lg border border-kx-border lg:hidden"
              aria-label="Ouvrir le menu"
            >
              <IconMenu className="h-5 w-5" />
            </button>
            <div className="lg:hidden">
              <Logo size="sm" compact />
            </div>
          </div>

          {/* Right Header items */}
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            {/* Running scan pill */}
            {runningScansCount > 0 && (
              <div
                onClick={() => onNavigate('/scans')}
                className="cursor-pointer flex items-center gap-2 rounded-full bg-kx-navy px-3 py-1 text-xs font-medium text-white shadow-xs hover:bg-zinc-800 transition"
              >
                <span className="h-2 w-2 rounded-full bg-kx-teal animate-pulse" />
                <span>
                  {runningScansCount} scan{runningScansCount > 1 ? 's' : ''} en cours
                </span>
              </div>
            )}

            {/* Quick new scan button on desktop */}
            <button
              onClick={() => onNavigate('/scans/new')}
              className="btn btn-sm hidden sm:inline-flex"
            >
              <IconPlus className="h-3.5 w-3.5" />
              <span>Nouveau scan</span>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative grid h-9 w-9 place-items-center rounded-full border border-kx-border bg-white hover:border-black/30 transition"
                aria-label="Notifications"
              >
                <IconBell className="h-4 w-4 text-black" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {notificationsOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setNotificationsOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 z-50 w-80 rounded-2xl border border-kx-border bg-white p-3 shadow-2xl">
                    <div className="flex items-center justify-between pb-2 border-b border-kx-border px-1">
                      <span className="font-semibold text-sm">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs text-kx-muted hover:text-black underline"
                        >
                          Tout marquer comme lu
                        </button>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto divide-y divide-kx-border py-1">
                      {notifications.length === 0 ? (
                        <p className="py-6 text-center text-xs text-kx-muted">
                          Aucune notification pour le moment.
                        </p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              if (n.link) {
                                onNavigate(n.link);
                                setNotificationsOpen(false);
                              }
                            }}
                            className={`cursor-pointer p-2.5 text-xs rounded-lg transition ${
                              n.read ? 'hover:bg-kx-panel2 text-kx-muted' : 'bg-kx-panel2/70 font-medium text-black'
                            }`}
                          >
                            <p className="font-semibold text-black">{n.title}</p>
                            <p className="mt-0.5 line-clamp-2 text-kx-muted">{n.message}</p>
                            <span className="mt-1 block text-[10px] text-zinc-400">
                              {new Date(n.created_at).toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content View */}
        <main className="mx-auto w-full min-w-0 max-w-6xl px-4 py-6 sm:px-8 sm:py-8 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
