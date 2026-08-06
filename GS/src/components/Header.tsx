import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Sun,
  Moon,
  Wifi,
  WifiOff,
  Bell,
  Download,
  Plus,
  Menu,
  Pill
} from 'lucide-react';

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const {
    darkMode,
    toggleDarkMode,
    activeTab,
    setActiveTab,
    isOnline,
    pendingSyncCount,
    syncOfflineData,
    deferredInstallPrompt,
    installPWA,
    isPWAInstalled,
    notifications,
    setIsBranchModalOpen,
    setEditingBranch
  } = useApp();

  const unreadCount = notifications.filter(n => !n.read).length;

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return { title: 'Dashboard Analytics', sub: 'Métricas, estado general y cobertura regional' };
      case 'branches': return { title: 'Gestión de Sucursales', sub: 'Control de servidores, IPs, bases de datos y servicios' };
      case 'zones': return { title: 'Zonas y Provincias', sub: 'Organización geográfica regional' };
      case 'reports': return { title: 'Reportes Mensuales', sub: 'Generación e impresión en formato PDF y Excel' };
      case 'notifications': return { title: 'Centro de Alertas Push FCM', sub: 'Notificaciones en tiempo real y pruebas FCM' };
      case 'audit': return { title: 'Registro de Auditoría', sub: 'Historial de actividades y cambios del sistema' };
      case 'settings': return { title: 'Configuración de Columnas & CSV', sub: 'Personalización de campos, backup local y base de datos' };
      case 'help': return { title: 'Guía y Ayuda', sub: 'Instrucciones de uso del sistema' };
      default: return { title: 'FEX Pharmacy', sub: 'Gestión de Sucursales' };
    }
  };

  const { title, sub } = getPageTitle();

  const handleCreateNewBranch = () => {
    setEditingBranch(null);
    setIsBranchModalOpen(true);
    if (activeTab !== 'branches') {
      setActiveTab('branches');
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 md:px-8 py-2.5 transition-colors duration-200">
      <div className="flex items-center justify-between gap-4">
        
        {/* Left section: Title & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
            title="Abrir Menú"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 md:hidden text-indigo-400 font-bold">
            <Pill className="w-5 h-5 text-indigo-400" />
          </div>

          <div>
            <h1 className="text-base md:text-lg font-bold text-white tracking-tight leading-tight flex items-center gap-2">
              {title}
            </h1>
            <p className="hidden sm:block text-[11px] text-slate-400 mt-0.5 font-medium">
              {sub}
            </p>
          </div>
        </div>

        {/* Right Section: Actions & Badges */}
        <div className="flex items-center gap-2 sm:gap-2.5">

          {/* Online/Offline Indicator */}
          <div className="flex items-center">
            {isOnline ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="hidden sm:inline">ONLINE</span>
              </span>
            ) : (
              <button
                onClick={syncOfflineData}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse"
                title="Haga clic para forzar reintento de sincronización"
              >
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                <span>OFFLINE {pendingSyncCount > 0 ? `(${pendingSyncCount})` : ''}</span>
              </button>
            )}
          </div>

          {/* Chrome PWA Install Button */}
          {deferredInstallPrompt && !isPWAInstalled && (
            <button
              onClick={installPWA}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 text-xs font-semibold hover:bg-indigo-500/20 transition-all shadow-sm"
              title="Instalar como aplicación de escritorio / móvil Chrome"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden lg:inline text-[11px] uppercase tracking-wider font-bold">Instalar App</span>
            </button>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-1.5 text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors"
            title={darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
          </button>

          {/* FCM Push Notification Bell */}
          <button
            onClick={() => setActiveTab('notifications')}
            className="relative p-1.5 text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors"
            title="Centro de Alertas Push"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-mono font-bold text-white ring-2 ring-slate-950">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Add Branch Button */}
          <button
            onClick={handleCreateNewBranch}
            className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm shadow-indigo-600/20 transition-all uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nueva Sucursal</span>
          </button>

        </div>
      </div>
    </header>
  );
};
