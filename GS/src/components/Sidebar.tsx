import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Store,
  MapPin,
  FileText,
  Bell,
  History,
  Settings,
  HelpCircle,
  Pill,
  X,
  ShieldCheck,
  Smartphone
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const {
    activeTab,
    setActiveTab,
    branches,
    notifications,
    deferredInstallPrompt,
    installPWA,
    isPWAInstalled
  } = useApp();

  const activeBranchCount = branches.filter(b => b.status === 'active').length;
  const unreadNotifCount = notifications.filter(n => !n.read).length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'branches', label: 'Sucursales', icon: Store, badge: branches.length },
    { id: 'zones', label: 'Zonas y Provincias', icon: MapPin },
    { id: 'reports', label: 'Reportes Mensuales', icon: FileText },
    { id: 'notifications', label: 'Alertas FCM Push', icon: Bell, badge: unreadNotifCount > 0 ? unreadNotifCount : undefined, badgeColor: 'bg-rose-500 text-white' },
    { id: 'audit', label: 'Auditoría', icon: History },
  ];

  const configItems = [
    { id: 'settings', label: 'Configuración & CSV', icon: Settings },
    { id: 'help', label: 'Ayuda y Guía', icon: HelpCircle },
  ];

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm md:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Body */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-slate-900/95 border-r border-slate-800 text-slate-200 flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div>
          <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/40">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
                <Pill className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-extrabold text-sm tracking-tight text-white leading-tight uppercase font-mono">
                  FEX Pharmacy
                </h2>
                <p className="text-[10px] font-bold text-indigo-400 tracking-wider uppercase">
                  Gestión Sucursales
                </p>
              </div>
            </div>
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Nav Items */}
          <div className="p-3 space-y-5">
            <div>
              <p className="px-2 text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                Navegación
              </p>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg font-medium text-xs transition-all duration-150 ${
                        isActive
                          ? 'bg-slate-800 text-white font-semibold border border-slate-700 shadow-sm'
                          : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                        <span className={isActive ? 'font-bold text-white' : ''}>{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span className={`px-1.5 py-0.5 text-[10px] font-mono font-bold rounded ${item.badgeColor || (isActive ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700/50')}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div>
              <p className="px-2 text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                Sistema
              </p>
              <nav className="space-y-1">
                {configItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg font-medium text-xs transition-all duration-150 ${
                        isActive
                          ? 'bg-slate-800 text-white font-semibold border border-slate-700 shadow-sm'
                          : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                        <span className={isActive ? 'font-bold text-white' : ''}>{item.label}</span>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Footer info & Chrome PWA install trigger */}
        <div className="p-3 border-t border-slate-800 space-y-2.5 bg-slate-950/40">
          {deferredInstallPrompt && !isPWAInstalled && (
            <button
              onClick={installPWA}
              className="w-full flex items-center justify-center gap-2 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-sm transition-all uppercase tracking-wider"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Instalar PWA Chrome</span>
            </button>
          )}

          <div className="bg-slate-900 rounded-lg p-2.5 border border-slate-800">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span className="flex items-center gap-1 font-bold text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> PWA v2.1
              </span>
              <span className="text-emerald-400 font-mono font-bold">{activeBranchCount} ACT</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              Sincronización Sync & Notificaciones FCM
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
