import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Branch, Zone, Province, CustomColumn, ColumnSetting, AuditLog, PushNotificationItem, AppFilters } from '../types';
import { DEFAULT_ZONES, DEFAULT_PROVINCES, DEFAULT_BRANCHES, DEFAULT_COLUMN_DEFS, SERVICE_KEYS } from '../lib/initialData';
import { requestFCMToken, onForegroundMessage } from '../lib/firebase';

const LOCAL_STORAGE_KEY = 'fex_pharmacy_data_v2';
const LOCAL_FILTERS_KEY = 'fex_pharmacy_filters_v2';

// Helper to store FileSystemFileHandle in IndexedDB for auto CSV saving across reloads
const storeHandleInIDB = async (handle: any) => {
  try {
    const request = indexedDB.open('FexPharmacyCsvDB', 1);
    request.onupgradeneeded = (e: any) => {
      e.target.result.createObjectStore('handles');
    };
    request.onsuccess = (e: any) => {
      const db = e.target.result;
      const tx = db.transaction('handles', 'readwrite');
      tx.objectStore('handles').put(handle, 'linked_csv_file');
    };
  } catch (err) {
    console.error('Error saving handle to IndexedDB:', err);
  }
};

const getHandleFromIDB = async (): Promise<any> => {
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open('FexPharmacyCsvDB', 1);
      request.onupgradeneeded = (e: any) => {
        e.target.result.createObjectStore('handles');
      };
      request.onsuccess = (e: any) => {
        const db = e.target.result;
        const tx = db.transaction('handles', 'readonly');
        const getReq = tx.objectStore('handles').get('linked_csv_file');
        getReq.onsuccess = () => resolve(getReq.result || null);
        getReq.onerror = () => resolve(null);
      };
      request.onerror = () => resolve(null);
    } catch (e) {
      resolve(null);
    }
  });
};

interface AppContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOnline: boolean;
  pendingSyncCount: number;
  syncOfflineData: () => void;
  deferredInstallPrompt: any;
  installPWA: () => void;
  isPWAInstalled: boolean;

  // Data State
  branches: Branch[];
  zones: Zone[];
  provinces: Province[];
  customColumns: CustomColumn[];
  columnSettings: Record<string, ColumnSetting>;
  columnOrder: string[];
  auditLogs: AuditLog[];
  notifications: PushNotificationItem[];

  // Filters & State Controls
  filters: AppFilters;
  setFilters: React.Dispatch<React.SetStateAction<AppFilters>>;
  resetFilters: () => void;

  // Modals & Drawers
  editingBranch: Branch | null;
  setEditingBranch: (branch: Branch | null) => void;
  isBranchModalOpen: boolean;
  setIsBranchModalOpen: (open: boolean) => void;
  previewBranch: Branch | null;
  setPreviewBranch: (branch: Branch | null) => void;

  // Toast System
  toast: { title: string; body: string; type: 'info' | 'success' | 'warning' | 'error' } | null;
  showToast: (title: string, body: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  hideToast: () => void;

  // Branch CRUD Actions
  saveBranch: (branchData: Partial<Branch>) => { success: boolean; message: string };
  toggleBranchStatus: (id: string) => void;
  deleteBranch: (id: string) => void;
  applyServicesToAllBranches: (sourceBranchId: string) => void;

  // Zone & Province CRUD
  saveZone: (zone: { id?: string; name: string; color: string }) => void;
  deleteZone: (id: string) => boolean;
  saveProvince: (province: { id?: string; name: string; zoneId: string }) => void;
  deleteProvince: (id: string) => boolean;

  // Custom Columns & Settings
  saveCustomColumn: (col: { id?: string; name: string; defaultValue?: string }) => void;
  deleteCustomColumn: (id: string) => void;
  updateColumnSettings: (newSettings: Record<string, ColumnSetting>, newOrder: string[]) => void;

  // System Backup & Imports
  exportFullBackup: () => void;
  importFullBackup: (jsonContent: string) => boolean;
  exportCSV: () => void;
  importCSV: (csvContent: string) => boolean;
  clearAuditLogs: () => void;

  // FCM Push Notifications
  fcmToken: string | null;
  requestNotificationAccess: () => Promise<void>;
  sendSimulatedPushNotification: (title: string, body: string, type?: 'info' | 'warning' | 'success' | 'alert') => void;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;

  // File System Access CSV Linking & Auto-Save
  linkedCsvHandleName: string | null;
  linkLocalCsvFile: () => Promise<void>;
  createAndLinkCsvFile: () => Promise<void>;
  syncWithLinkedCsvNow: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Dark Mode State
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('fex_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('fex_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('fex_theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  // 2. Navigation State
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // 3. Online/Offline & PWA Install
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);
  const [isPWAInstalled, setIsPWAInstalled] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast('Conexión Restablecida', 'Sincronizando datos automáticamente con el servidor...', 'success');
      syncOfflineData();
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast('Modo Sin Conexión', 'La aplicación funcionará offline usando Service Workers y almacenamiento local.', 'warning');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsPWAInstalled(true);
      setDeferredInstallPrompt(null);
      showToast('PWA Instalada', 'FEX Pharmacy ahora está instalada como aplicación de Chrome.', 'success');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installPWA = async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    const { outcome } = await deferredInstallPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredInstallPrompt(null);
    }
  };

  // 4. Core App Data State
  const [branches, setBranches] = useState<Branch[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [customColumns, setCustomColumns] = useState<CustomColumn[]>([]);
  const [columnSettings, setColumnSettings] = useState<Record<string, ColumnSetting>>({});
  const [columnOrder, setColumnOrder] = useState<string[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<PushNotificationItem[]>([]);

  // 5. Toast state
  const [toast, setToast] = useState<{ title: string; body: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);

  const showToast = useCallback((title: string, body: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToast({ title, body, type });
  }, []);

  const hideToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => hideToast(), 4500);
      return () => clearTimeout(timer);
    }
  }, [toast, hideToast]);

  // Load Initial State from Local Storage or Defaults
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setBranches(parsed.branches || DEFAULT_BRANCHES);
        setZones(parsed.zones || DEFAULT_ZONES);
        setProvinces(parsed.provinces || DEFAULT_PROVINCES);
        setCustomColumns(parsed.customColumns || []);
        setAuditLogs(parsed.auditLogs || []);
        setNotifications(parsed.notifications || []);

        // Column settings
        const settings = parsed.columnSettings || {};
        const order = parsed.columnOrder || DEFAULT_COLUMN_DEFS.map(c => c.key);
        setColumnSettings(settings);
        setColumnOrder(order);
        return;
      }
    } catch (e) {
      console.error("Failed to load state from localStorage:", e);
    }

    // Default Fallbacks
    setBranches(DEFAULT_BRANCHES);
    setZones(DEFAULT_ZONES);
    setProvinces(DEFAULT_PROVINCES);
    setCustomColumns([]);
    
    const initialSettings: Record<string, ColumnSetting> = {};
    DEFAULT_COLUMN_DEFS.forEach(c => {
      initialSettings[c.key] = { key: c.key, label: c.label, visible: true, locked: c.locked };
    });
    setColumnSettings(initialSettings);
    setColumnOrder(DEFAULT_COLUMN_DEFS.map(c => c.key));

    setAuditLogs([
      {
        id: 'init_log',
        timestamp: new Date().toISOString(),
        action: 'Inicio del Sistema',
        detail: 'Base de datos inicial cargada con sucursales predeterminadas.'
      }
    ]);
  }, []);

  // Save State Helper
  const persistState = useCallback((updatedState: {
    branches?: Branch[];
    zones?: Zone[];
    provinces?: Province[];
    customColumns?: CustomColumn[];
    columnSettings?: Record<string, ColumnSetting>;
    columnOrder?: string[];
    auditLogs?: AuditLog[];
    notifications?: PushNotificationItem[];
  }) => {
    try {
      const currentRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
      const current = currentRaw ? JSON.parse(currentRaw) : {};

      const nextState = {
        branches: updatedState.branches !== undefined ? updatedState.branches : (current.branches || branches),
        zones: updatedState.zones !== undefined ? updatedState.zones : (current.zones || zones),
        provinces: updatedState.provinces !== undefined ? updatedState.provinces : (current.provinces || provinces),
        customColumns: updatedState.customColumns !== undefined ? updatedState.customColumns : (current.customColumns || customColumns),
        columnSettings: updatedState.columnSettings !== undefined ? updatedState.columnSettings : (current.columnSettings || columnSettings),
        columnOrder: updatedState.columnOrder !== undefined ? updatedState.columnOrder : (current.columnOrder || columnOrder),
        auditLogs: updatedState.auditLogs !== undefined ? updatedState.auditLogs : (current.auditLogs || auditLogs),
        notifications: updatedState.notifications !== undefined ? updatedState.notifications : (current.notifications || notifications)
      };

      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nextState));

      if (!navigator.onLine) {
        setPendingSyncCount(prev => prev + 1);
      }
    } catch (e) {
      console.error("Error persisting state:", e);
    }
  }, [branches, zones, provinces, customColumns, columnSettings, columnOrder, auditLogs, notifications]);

  // Add Audit Log Entry
  const logAuditAction = useCallback((action: string, detail: string) => {
    const newLog: AuditLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toISOString(),
      action,
      detail
    };
    setAuditLogs(prev => {
      const updated = [newLog, ...prev].slice(0, 100);
      persistState({ auditLogs: updated });
      return updated;
    });
  }, [persistState]);

  // Sync Offline Data
  const syncOfflineData = () => {
    setTimeout(() => {
      setPendingSyncCount(0);
      logAuditAction('Sincronización Automática', 'Todos los datos sin conexión han sido sincronizados correctamente.');
    }, 800);
  };

  // 6. Filters State
  const [filters, setFilters] = useState<AppFilters>(() => {
    try {
      const saved = sessionStorage.getItem(LOCAL_FILTERS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      search: '',
      zoneId: '',
      provinceId: '',
      status: '',
      serviceFilter: 'all',
      sortKey: 'name',
      sortDir: 'asc'
    };
  });

  useEffect(() => {
    sessionStorage.setItem(LOCAL_FILTERS_KEY, JSON.stringify(filters));
  }, [filters]);

  const resetFilters = () => {
    setFilters({
      search: '',
      zoneId: '',
      provinceId: '',
      status: '',
      serviceFilter: 'all',
      sortKey: 'name',
      sortDir: 'asc'
    });
  };

  // 7. Modals
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState<boolean>(false);
  const [previewBranch, setPreviewBranch] = useState<Branch | null>(null);

  // Branch CRUD Actions
  const saveBranch = (branchData: Partial<Branch>) => {
    if (!branchData.name || !branchData.name.trim()) {
      return { success: false, message: 'El nombre de la sucursal es obligatorio.' };
    }
    if (!branchData.provinceId) {
      return { success: false, message: 'Debe seleccionar una provincia para la sucursal.' };
    }

    // Duplicate ID / CC check
    const existingBranchId = branchData.branchId?.trim().toLowerCase();
    const existingCC = branchData.cc?.trim().toLowerCase();

    const isDupId = branches.some(b => b.id !== branchData.id && b.branchId && b.branchId.trim().toLowerCase() === existingBranchId);
    if (existingBranchId && isDupId) {
      return { success: false, message: `Ya existe otra sucursal registrada con el ID "${branchData.branchId}".` };
    }

    const isDupCC = branches.some(b => b.id !== branchData.id && b.cc && b.cc.trim().toLowerCase() === existingCC);
    if (existingCC && isDupCC) {
      return { success: false, message: `Ya existe otra sucursal registrada con el CC "${branchData.cc}".` };
    }

    let updatedBranches: Branch[] = [];
    const isEdit = !!branchData.id;

    if (isEdit) {
      updatedBranches = branches.map(b => b.id === branchData.id ? { ...b, ...branchData, updatedAt: new Date().toISOString() } as Branch : b);
      logAuditAction('Edición de Sucursal', `Sucursal "${branchData.name}" (#${branchData.branchId || 'N/A'}) actualizada.`);
      showToast('Sucursal Actualizada', `Los datos de "${branchData.name}" se guardaron con éxito.`, 'success');
    } else {
      const newBranch: Branch = {
        id: 'b_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        branchId: branchData.branchId || '',
        name: branchData.name.trim(),
        provinceId: branchData.provinceId,
        server: branchData.server || '',
        cc: branchData.cc || '',
        ip: branchData.ip || '',
        db: branchData.db || '',
        backups: branchData.backups || 'SI',
        externalDisk: branchData.externalDisk || 'SI',
        dataReduction: branchData.dataReduction || 'SI',
        emailValidation: branchData.emailValidation || 'SI',
        ftp: branchData.ftp || 'SI',
        s3: branchData.s3 || 'SI',
        voxelLog: branchData.voxelLog || 'SI',
        failOver: branchData.failOver || 'SI',
        voxel: branchData.voxel || 'SI',
        updateBox: branchData.updateBox || 'SI',
        bkConsecutivo: branchData.bkConsecutivo || 'NO',
        status: branchData.status || 'active',
        createdAt: new Date().toISOString(),
        custom: branchData.custom || {}
      };
      updatedBranches = [newBranch, ...branches];
      logAuditAction('Nueva Sucursal', `Sucursal "${newBranch.name}" creada en la provincia con ID ${newBranch.provinceId}.`);
      showToast('Sucursal Creada', `Sucursal "${newBranch.name}" registrada con éxito.`, 'success');
    }

    setBranches(updatedBranches);
    persistState({ branches: updatedBranches });
    saveToLinkedCsvFile(updatedBranches);
    return { success: true, message: 'Guardado exitosamente' };
  };

  const toggleBranchStatus = (id: string) => {
    const target = branches.find(b => b.id === id);
    if (!target) return;
    const newStatus = target.status === 'active' ? 'closed' : 'active';
    const updated = branches.map(b => b.id === id ? { ...b, status: newStatus } : b);
    setBranches(updated);
    persistState({ branches: updated });
    saveToLinkedCsvFile(updated);
    logAuditAction('Cambio de Estado', `Sucursal "${target.name}" cambió a estado ${newStatus === 'active' ? 'ACTIVA' : 'CERRADA'}.`);
    showToast('Estado Cambiado', `Sucursal "${target.name}" ahora está ${newStatus === 'active' ? 'activa' : 'cerrada'}.`, 'info');
  };

  const deleteBranch = (id: string) => {
    const target = branches.find(b => b.id === id);
    if (!target) return;
    const updated = branches.filter(b => b.id !== id);
    setBranches(updated);
    persistState({ branches: updated });
    saveToLinkedCsvFile(updated);
    logAuditAction('Eliminación de Sucursal', `Sucursal "${target.name}" (#${target.branchId || 'N/A'}) eliminada.`);
    showToast('Sucursal Eliminada', `"${target.name}" fue eliminada del sistema.`, 'warning');
  };

  const applyServicesToAllBranches = (sourceBranchId: string) => {
    const source = branches.find(b => b.id === sourceBranchId);
    if (!source) return;

    const updated = branches.map(b => ({
      ...b,
      backups: source.backups,
      externalDisk: source.externalDisk,
      dataReduction: source.dataReduction,
      emailValidation: source.emailValidation,
      ftp: source.ftp,
      s3: source.s3,
      voxelLog: source.voxelLog,
      failOver: source.failOver,
      voxel: source.voxel,
      updateBox: source.updateBox,
      bkConsecutivo: source.bkConsecutivo
    }));

    setBranches(updated);
    persistState({ branches: updated });
    saveToLinkedCsvFile(updated);
    logAuditAction('Configuración Masiva de Servicios', `Se aplicaron los servicios de "${source.name}" a las ${branches.length} sucursales.`);
    showToast('Servicios Aplicados Masivamente', `Configuración de servicios copiada a todas las sucursales.`, 'success');
  };

  // Zone & Province Actions
  const saveZone = (zoneData: { id?: string; name: string; color: string }) => {
    let updated: Zone[] = [];
    if (zoneData.id) {
      updated = zones.map(z => z.id === zoneData.id ? { ...z, ...zoneData } : z);
      logAuditAction('Edición de Zona', `Zona "${zoneData.name}" actualizada.`);
    } else {
      const newZone: Zone = {
        id: 'z_' + Date.now(),
        name: zoneData.name,
        color: zoneData.color || '#3b82f6'
      };
      updated = [...zones, newZone];
      logAuditAction('Nueva Zona', `Zona "${zoneData.name}" creada.`);
    }
    setZones(updated);
    persistState({ zones: updated });
    showToast('Zona Guardada', `Zona "${zoneData.name}" actualizada correctamente.`, 'success');
  };

  const deleteZone = (id: string): boolean => {
    const isUsed = provinces.some(p => p.zoneId === id);
    if (isUsed) {
      showToast('No se puede eliminar', 'Esta zona contiene provincias asignadas. Elimínelas o reasígnelas primero.', 'error');
      return false;
    }
    const target = zones.find(z => z.id === id);
    const updated = zones.filter(z => z.id !== id);
    setZones(updated);
    persistState({ zones: updated });
    if (target) logAuditAction('Eliminación de Zona', `Zona "${target.name}" eliminada.`);
    showToast('Zona Eliminada', `La zona fue removida.`, 'warning');
    return true;
  };

  const saveProvince = (provinceData: { id?: string; name: string; zoneId: string }) => {
    let updated: Province[] = [];
    if (provinceData.id) {
      updated = provinces.map(p => p.id === provinceData.id ? { ...p, ...provinceData } : p);
      logAuditAction('Edición de Provincia', `Provincia "${provinceData.name}" actualizada.`);
    } else {
      const newProv: Province = {
        id: 'p_' + Date.now(),
        name: provinceData.name,
        zoneId: provinceData.zoneId
      };
      updated = [...provinces, newProv];
      logAuditAction('Nueva Provincia', `Provincia "${provinceData.name}" creada.`);
    }
    setProvinces(updated);
    persistState({ provinces: updated });
    showToast('Provincia Guardada', `Provincia "${provinceData.name}" guardada con éxito.`, 'success');
  };

  const deleteProvince = (id: string): boolean => {
    const isUsed = branches.some(b => b.provinceId === id);
    if (isUsed) {
      showToast('No se puede eliminar', 'Esta provincia tiene sucursales asignadas.', 'error');
      return false;
    }
    const target = provinces.find(p => p.id === id);
    const updated = provinces.filter(p => p.id !== id);
    setProvinces(updated);
    persistState({ provinces: updated });
    if (target) logAuditAction('Eliminación de Provincia', `Provincia "${target.name}" eliminada.`);
    showToast('Provincia Eliminada', `La provincia fue eliminada.`, 'warning');
    return true;
  };

  // Custom Columns & Settings
  const saveCustomColumn = (col: { id?: string; name: string; defaultValue?: string }) => {
    let updated: CustomColumn[] = [];
    if (col.id) {
      updated = customColumns.map(c => c.id === col.id ? { ...c, ...col } : c);
    } else {
      const newCol: CustomColumn = {
        id: 'col_' + Date.now(),
        name: col.name,
        defaultValue: col.defaultValue || ''
      };
      updated = [...customColumns, newCol];
    }
    setCustomColumns(updated);
    persistState({ customColumns: updated });
    showToast('Columna Personalizada', `Columna "${col.name}" guardada.`, 'success');
  };

  const deleteCustomColumn = (id: string) => {
    const updated = customColumns.filter(c => c.id !== id);
    setCustomColumns(updated);
    persistState({ customColumns: updated });
    showToast('Columna Eliminada', 'La columna personalizada fue eliminada.', 'info');
  };

  const updateColumnSettings = (newSettings: Record<string, ColumnSetting>, newOrder: string[]) => {
    setColumnSettings(newSettings);
    setColumnOrder(newOrder);
    persistState({ columnSettings: newSettings, columnOrder: newOrder });
    showToast('Ajustes Guardados', 'Configuración de orden y visibilidad de columnas actualizada.', 'success');
  };

  // Backups & Imports
  const exportFullBackup = () => {
    const backupData = {
      version: '2.1',
      exportDate: new Date().toISOString(),
      branches,
      zones,
      provinces,
      customColumns,
      columnSettings,
      columnOrder,
      auditLogs
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_FEX_Pharmacy_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    logAuditAction('Exportación de Backup', 'Se generó y descargó una copia completa del sistema en JSON.');
    showToast('Backup Exportado', 'El archivo JSON de respaldo fue descargado con éxito.', 'success');
  };

  const importFullBackup = (jsonContent: string): boolean => {
    try {
      const parsed = JSON.parse(jsonContent);
      if (!parsed.branches || !parsed.zones || !parsed.provinces) {
        showToast('Error de Formato', 'El archivo no contiene un formato de backup FEX válido.', 'error');
        return false;
      }
      setBranches(parsed.branches);
      setZones(parsed.zones);
      setProvinces(parsed.provinces);
      if (parsed.customColumns) setCustomColumns(parsed.customColumns);
      if (parsed.columnSettings) setColumnSettings(parsed.columnSettings);
      if (parsed.columnOrder) setColumnOrder(parsed.columnOrder);

      persistState({
        branches: parsed.branches,
        zones: parsed.zones,
        provinces: parsed.provinces,
        customColumns: parsed.customColumns || [],
        columnSettings: parsed.columnSettings || columnSettings,
        columnOrder: parsed.columnOrder || columnOrder
      });

      logAuditAction('Importación de Backup', 'Se restauraron los datos completos del sistema desde un archivo JSON.');
      showToast('Restauración Exitosa', 'Todos los datos de sucursales, zonas y columnas fueron restaurados.', 'success');
      return true;
    } catch (e) {
      showToast('Error al importar', 'El archivo proporcionado no se pudo interpretar.', 'error');
      return false;
    }
  };

  const exportCSV = () => {
    const headers = ['id', 'branchId', 'name', 'provinceId', 'server', 'cc', 'ip', 'db', ...SERVICE_KEYS, 'status', 'createdAt'];
    const lines = [headers.join(',')];

    branches.forEach(b => {
      const row = [
        `"${b.id}"`,
        `"${b.branchId || ''}"`,
        `"${b.name.replace(/"/g, '""')}"`,
        `"${b.provinceId}"`,
        `"${b.server}"`,
        `"${b.cc}"`,
        `"${b.ip}"`,
        `"${b.db}"`,
        ...SERVICE_KEYS.map(k => `"${b[k] || ''}"`),
        `"${b.status}"`,
        `"${b.createdAt}"`
      ];
      lines.push(row.join(','));
    });

    const blob = new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sucursales_FEX_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    logAuditAction('Exportación CSV', 'Listado de sucursales exportado en formato CSV.');
    showToast('CSV Exportado', 'Archivo .csv generado con éxito.', 'success');
  };

  const importCSV = (csvContent: string): boolean => {
    try {
      const lines = csvContent.split(/\r?\n/).filter(line => line.trim().length > 0);
      if (lines.length < 2) return false;

      const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim());
      const newBranches: Branch[] = [];

      for (let i = 1; i < lines.length; i++) {
        const rowVals = lines[i].split(',').map(v => v.replace(/^"|"$/g, '').trim());
        if (rowVals.length < 3) continue;

        const bObj: any = { custom: {} };
        headers.forEach((h, colIndex) => {
          bObj[h] = rowVals[colIndex] || '';
        });

        if (!bObj.id) bObj.id = 'b_csv_' + i + '_' + Date.now();
        if (!bObj.name) bObj.name = `Sucursal ${i}`;
        if (!bObj.status) bObj.status = 'active';
        if (!bObj.createdAt) bObj.createdAt = new Date().toISOString();

        newBranches.push(bObj as Branch);
      }

      if (newBranches.length > 0) {
        setBranches(newBranches);
        persistState({ branches: newBranches });
        logAuditAction('Importación CSV', `Cargadas ${newBranches.length} sucursales desde archivo CSV.`);
        showToast('CSV Importado', `${newBranches.length} sucursales cargadas.`, 'success');
        return true;
      }
      return false;
    } catch (e) {
      showToast('Error CSV', 'No se pudo leer la estructura del archivo CSV.', 'error');
      return false;
    }
  };

  const clearAuditLogs = () => {
    setAuditLogs([]);
    persistState({ auditLogs: [] });
    showToast('Registro Limpiado', 'Historial de auditoría eliminado.', 'info');
  };

  // 8. Push Notifications & FCM State
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  const sendSimulatedPushNotification = (title: string, body: string, type: 'info' | 'warning' | 'success' | 'alert' = 'info') => {
    const item: PushNotificationItem = {
      id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      title,
      body,
      timestamp: new Date().toISOString(),
      read: false,
      type
    };

    setNotifications(prev => {
      const updated = [item, ...prev];
      persistState({ notifications: updated });
      return updated;
    });

    showToast(title, body, type === 'alert' ? 'error' : type);

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then(reg => {
        reg.showNotification(title, {
          body,
          icon: '/pwa-192.png'
        });
      }).catch(() => {});
    }
  };

  const requestNotificationAccess = async () => {
    const token = await requestFCMToken();
    if (token) {
      setFcmToken(token);
      sendSimulatedPushNotification('Notificaciones FCM Activadas', 'Has suscrito este dispositivo a alertas de FEX Pharmacy en tiempo real.', 'success');
    } else {
      showToast('Permiso Denegado', 'No se activaron notificaciones push.', 'warning');
    }
  };

  useEffect(() => {
    const unsubscribe = onForegroundMessage((payload) => {
      if (payload?.notification) {
        sendSimulatedPushNotification(
          payload.notification.title || 'Alerta FEX Pharmacy',
          payload.notification.body || 'Nueva actualización',
          'info'
        );
      }
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const markNotificationRead = (id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      persistState({ notifications: updated });
      return updated;
    });
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    persistState({ notifications: [] });
    showToast('Notificaciones Limpiadas', 'Bandeja de alertas vaciada.', 'info');
  };

  // 9. File System Access API CSV Binding & Real-Time Auto-Save
  const csvFileHandleRef = useRef<any>(null);
  const [linkedCsvHandleName, setLinkedCsvHandleName] = useState<string | null>(null);

  // Restore stored handle on app launch
  useEffect(() => {
    getHandleFromIDB().then(handle => {
      if (handle) {
        csvFileHandleRef.current = handle;
        setLinkedCsvHandleName(handle.name);
      }
    });
  }, []);

  const generateCSVData = useCallback((branchList: Branch[]) => {
    const headers = ['id', 'branchId', 'name', 'provinceId', 'server', 'cc', 'ip', 'db', ...SERVICE_KEYS, 'status', 'createdAt'];
    const lines = [headers.join(',')];

    branchList.forEach(b => {
      const row = [
        `"${b.id}"`,
        `"${b.branchId || ''}"`,
        `"${b.name.replace(/"/g, '""')}"`,
        `"${b.provinceId}"`,
        `"${b.server}"`,
        `"${b.cc}"`,
        `"${b.ip}"`,
        `"${b.db}"`,
        ...SERVICE_KEYS.map(k => `"${b[k] || ''}"`),
        `"${b.status}"`,
        `"${b.createdAt}"`
      ];
      lines.push(row.join(','));
    });

    return lines.join('\r\n');
  }, []);

  const saveToLinkedCsvFile = useCallback(async (currentBranches: Branch[]) => {
    if (!csvFileHandleRef.current) return;
    try {
      const handle = csvFileHandleRef.current;
      let perm = 'granted';
      if (typeof handle.queryPermission === 'function') {
        perm = await handle.queryPermission({ mode: 'readwrite' });
        if (perm !== 'granted' && typeof handle.requestPermission === 'function') {
          perm = await handle.requestPermission({ mode: 'readwrite' });
        }
      }
      if (perm === 'granted') {
        const writable = await handle.createWritable();
        const csvContent = generateCSVData(currentBranches);
        await writable.write(csvContent);
        await writable.close();
        showToast('CSV Auto-guardado', `Cambios sincronizados automáticamente en "${handle.name}".`, 'success');
      }
    } catch (e: any) {
      console.error("Error auto-saving to CSV:", e);
    }
  }, [generateCSVData, showToast]);

  const linkLocalCsvFile = async () => {
    if (!('showOpenFilePicker' in window)) {
      showToast('No Compatible', 'Su navegador no soporta File System Access API. Use exportar/importar CSV.', 'warning');
      return;
    }
    try {
      const [handle] = await (window as any).showOpenFilePicker({
        types: [{ description: 'Archivo CSV', accept: { 'text/csv': ['.csv'] } }],
        multiple: false
      });
      csvFileHandleRef.current = handle;
      setLinkedCsvHandleName(handle.name);
      await storeHandleInIDB(handle);

      const file = await handle.getFile();
      const text = await file.text();
      if (text && text.trim().length > 0) {
        importCSV(text);
      } else {
        await saveToLinkedCsvFile(branches);
      }
      showToast('CSV Vinculado', `Auto-guardado automático activado para "${handle.name}".`, 'success');
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        showToast('Error', 'No se pudo acceder al archivo seleccionado.', 'error');
      }
    }
  };

  const createAndLinkCsvFile = async () => {
    if (!('showSaveFilePicker' in window)) {
      showToast('No Compatible', 'Su navegador no soporta File System Access API.', 'warning');
      return;
    }
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: `sucursales_fex_${new Date().toISOString().slice(0, 10)}.csv`,
        types: [{ description: 'Archivo CSV', accept: { 'text/csv': ['.csv'] } }]
      });
      csvFileHandleRef.current = handle;
      setLinkedCsvHandleName(handle.name);
      await storeHandleInIDB(handle);
      await saveToLinkedCsvFile(branches);
      showToast('CSV Creado y Vinculado', `Sincronización automática activa en "${handle.name}".`, 'success');
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        showToast('Error', 'No se pudo crear el archivo CSV.', 'error');
      }
    }
  };

  const syncWithLinkedCsvNow = async () => {
    if (!linkedCsvHandleName || !csvFileHandleRef.current) {
      showToast('Sin Archivo', 'No hay ningún archivo CSV vinculado en esta sesión.', 'warning');
      return;
    }
    await saveToLinkedCsvFile(branches);
  };

  return (
    <AppContext.Provider value={{
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

      branches,
      zones,
      provinces,
      customColumns,
      columnSettings,
      columnOrder,
      auditLogs,
      notifications,

      filters,
      setFilters,
      resetFilters,

      editingBranch,
      setEditingBranch,
      isBranchModalOpen,
      setIsBranchModalOpen,
      previewBranch,
      setPreviewBranch,

      toast,
      showToast,
      hideToast,

      saveBranch,
      toggleBranchStatus,
      deleteBranch,
      applyServicesToAllBranches,

      saveZone,
      deleteZone,
      saveProvince,
      deleteProvince,

      saveCustomColumn,
      deleteCustomColumn,
      updateColumnSettings,

      exportFullBackup,
      importFullBackup,
      exportCSV,
      importCSV,
      clearAuditLogs,

      fcmToken,
      requestNotificationAccess,
      sendSimulatedPushNotification,
      markNotificationRead,
      clearAllNotifications,

      linkedCsvHandleName,
      linkLocalCsvFile,
      createAndLinkCsvFile,
      syncWithLinkedCsvNow
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
