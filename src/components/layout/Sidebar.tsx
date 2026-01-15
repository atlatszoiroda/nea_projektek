import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Trophy,
  XCircle,
  Map,
  Download,
  BarChart3,
  TrendingUp
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/projektek', label: 'Összes projekt', icon: FileText },
  { path: '/nyertes', label: 'Nyertes projektek', icon: Trophy },
  { path: '/kizart', label: 'Kizárt projektek', icon: XCircle },
  { path: '/terkep', label: 'Térkép', icon: Map },
  { path: '/statisztikak', label: 'Statisztikák', icon: BarChart3 },
  { path: '/statisztikak/top-50', label: 'Top 50 Nyertes', icon: TrendingUp },
  { path: '/letoltes', label: 'Letöltés', icon: Download },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-sidebar-border bg-sidebar">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <span className="font-display text-lg font-bold text-primary-foreground">N</span>
          </div>
          <div>
            <h1 className="font-display text-lg font-bold text-foreground">NEA</h1>
            <p className="text-xs text-muted-foreground">Pályázati Dashboard</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`nav-link ${isActive ? 'active' : ''}`}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-4">
          <a
            href="https://atlatszo.hu"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <span>Szeretettel ❤️</span>
            <span className="font-medium text-primary">Átlátszó</span>
          </a>
        </div>
      </div>
    </aside>
  );
}
