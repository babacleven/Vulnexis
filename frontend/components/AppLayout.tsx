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

  const fetchNotifs = async () => {
    try {
      const res = await fetch('/api/v1/notifications/me');
      if (res.ok) {
        const json = await res.json();
        if (json.data?.items) {
          setNotifications(json.data.items);
          setUnreadCount(json.data.items.filter((n: NotificationItem) => !n.read).length);
        }
      }
      const countRes = await fetch('/api/v1/notifications/me/unread-count');
      if (countRes.ok) {
        const cJson = await countRes.json();
        setUnreadCount(cJson.data?.count || 0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAllRead = async () => {
    await fetch('/api/v1/notifications/read-all', { method: 'POST' }).catch(() => null);
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

  return (
    <div className="flex min-h-screen bg-[#f7f7f7] text-[#0a0a0a]">
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[#e4e4e7] bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex h-20 items-center px-6">
          <button
            onClick={() => {
              onNavigate('/dashboard');
              setMobileMenuOpen(false);
            }}
            className="text-left focus:outline-hidden"
          >
            <Logo size="md" />
          </button>
        </div>

        {/* Action: + Nouveau scan */}
        <div className="px-4 pb-4">
          <button
            onClick={() => {
              onNavigate('/scans/new');
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 rounded-full bg-black text-white px-4 py-2.5 text-sm font-semibold hover:bg-zinc-800 transition shadow-xs"
          >
            <IconPlus className="h-4 w-4" />
            <span>Nouveau scan</span>
          </button>
        </div>

        {/* Navigation links */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {navLinks.map((item) => {
            const active =
              currentPath === item.href ||
              (item.href !== '/dashboard' && currentPath.startsWith(item.href));
            const Icon = item.icon;
            return (
              <button
                key={item.href}
                onClick={() => {
                  onNavigate(item.href);
                  setMobileMenuOpen(false);
                }}
                className={`flex w-full items-center gap-3.5 rounded-xl px-4 py-2.5 text-sm transition ${
                  active
                    ? 'bg-[#f4f4f5] font-semibold text-black'
                    : 'text-zinc-600 hover:bg-[#f4f4f5] hover:text-black font-normal'
                }`}
              >
                <Icon
                  className={`h-4.5 w-4.5 shrink-0 ${
                    active ? 'text-black' : 'text-zinc-500'
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Bottom Sidebar: User Email & Logout */}
        <div className="border-t border-[#e4e4e7] p-4 space-y-2">
          <div className="px-2 text-xs text-zinc-500 truncate">
            {user?.email || 'babaaristote6@gmail.com'}
          </div>
          <button
            onClick={() => {
              logout();
              onNavigate('/login');
            }}
            className="flex items-center gap-2 px-2 py-1 text-sm text-zinc-600 hover:text-black transition w-full"
          >
            <IconLogout className="h-4 w-4 shrink-0" />
            <span>Se déconnecter</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#e4e4e7] bg-white px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="grid h-9 w-9 place-items-center rounded-lg border border-[#e4e4e7] lg:hidden"
              aria-label="Ouvrir le menu"
            >
              <IconMenu className="h-5 w-5" />
            </button>
            <div className="lg:hidden">
              <Logo size="sm" compact />
            </div>
          </div>

          {/* Right Header items */}
          <div className="ml-auto flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative grid h-9 w-9 place-items-center rounded-full border border-[#e4e4e7] bg-white hover:border-black/30 transition"
                aria-label="Notifications"
              >
                <IconBell className="h-4.5 w-4.5 text-black" />
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
                  <div className="absolute right-0 mt-2 z-50 w-80 rounded-2xl border border-[#e4e4e7] bg-white p-3 shadow-2xl">
                    <div className="flex items-center justify-between pb-2 border-b border-[#e4e4e7] px-1">
                      <span className="font-semibold text-sm">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs text-zinc-500 hover:text-black underline"
                        >
                          Tout marquer comme lu
                        </button>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto divide-y divide-[#e4e4e7] py-1">
                      {notifications.length === 0 ? (
                        <p className="py-6 text-center text-xs text-zinc-500">
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
                              n.read
                                ? 'hover:bg-[#f4f4f5] text-zinc-500'
                                : 'bg-[#f4f4f5]/70 font-medium text-black'
                            }`}
                          >
                            <p className="font-semibold text-black">{n.title}</p>
                            <p className="mt-0.5 line-clamp-2 text-zinc-600">{n.message}</p>
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

            {/* Solde Pill: [coin] 0 crédit [2 gratuits] */}
            <div
              onClick={() => onNavigate('/credits')}
              className="cursor-pointer flex items-center gap-2 rounded-full border border-[#e4e4e7] bg-white px-3 py-1 text-xs text-zinc-800 hover:border-black/30 transition select-none"
            >
              <IconCredits className="h-4 w-4 text-zinc-700" />
              <span className="font-medium">
                <b className="text-black font-semibold">
                  {creditsData?.credits ?? user?.credits ?? 0}
                </b>{' '}
                crédit
              </span>
              <span className="rounded-full bg-[#d7f7f1] text-[#134e4a] px-2 py-0.5 text-[11px] font-semibold">
                {creditsData?.free_scans ?? user?.free_scans ?? 2} gratuits
              </span>
            </div>
          </div>
        </header>

        {/* Page Content View */}
        <main className="mx-auto w-full min-w-0 max-w-6xl px-4 py-6 sm:px-8 sm:py-8 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
