import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Dashboard } from './components/Dashboard';
import { BranchesList } from './components/BranchesList';
import { ZonesAndProvinces } from './components/ZonesAndProvinces';
import { ReportsView } from './components/ReportsView';
import { NotificationsCenter } from './components/NotificationsCenter';
import { SettingsView } from './components/SettingsView';
import { AuditLogView } from './components/AuditLogView';
import { HelpView } from './components/HelpView';
import { BranchModal } from './components/BranchModal';
import { BranchPreviewModal } from './components/BranchPreviewModal';
import { Toast } from './components/Toast';

const MainContent: React.FC = () => {
  const { activeTab } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'branches': return <BranchesList />;
      case 'zones': return <ZonesAndProvinces />;
      case 'reports': return <ReportsView />;
      case 'notifications': return <NotificationsCenter />;
      case 'settings': return <SettingsView />;
      case 'audit': return <AuditLogView />;
      case 'help': return <HelpView />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 flex flex-col selection:bg-indigo-500 selection:text-white transition-colors duration-200 font-sans">
      
      {/* Desktop Sidebar & Mobile Drawer */}
      <Sidebar
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Body Wrapper (Shifted left margin for desktop sidebar) */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        
        {/* Sticky Header */}
        <Header onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />

        {/* Dynamic Tab Body */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-12">
          {renderTabContent()}
        </main>

        {/* Native Mobile Bottom Navbar */}
        <MobileBottomNav />

      </div>

      {/* Modals & Global Toast */}
      <BranchModal />
      <BranchPreviewModal />
      <Toast />

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
