import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DEFAULT_COLUMN_DEFS } from '../lib/initialData';
import {
  Settings,
  Table,
  Plus,
  Trash2,
  Save,
  Download,
  Upload,
  FileSpreadsheet,
  Link,
  RefreshCw,
  Mail,
  ArrowUp,
  ArrowDown,
  Check,
  X
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    columnSettings,
    columnOrder,
    updateColumnSettings,
    customColumns,
    saveCustomColumn,
    deleteCustomColumn,
    exportFullBackup,
    importFullBackup,
    exportCSV,
    importCSV,
    linkedCsvHandleName,
    linkLocalCsvFile,
    syncWithLinkedCsvNow,
    showToast
  } = useApp();

  // Local state for column settings editing
  const [localSettings, setLocalSettings] = useState(() => ({ ...columnSettings }));
  const [localOrder, setLocalOrder] = useState<string[]>(() => [...columnOrder]);

  // Modal State for custom column
  const [isCustomColModalOpen, setIsCustomColModalOpen] = useState(false);
  const [customColFormData, setCustomColFormData] = useState({ id: '', name: '', defaultValue: '' });

  // Email Test state
  const [testEmail, setTestEmail] = useState('admin@fexpharmacy.com');

  const handleToggleVisibility = (key: string) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        visible: !prev[key]?.visible
      }
    }));
  };

  const handleLabelChange = (key: string, label: string) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        label
      }
    }));
  };

  const handleMoveColumn = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...localOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;

    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;

    setLocalOrder(newOrder);
  };

  const handleSaveColumns = () => {
    updateColumnSettings(localSettings, localOrder);
  };

  // Custom Column Save
  const handleSaveCustomColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customColFormData.name.trim()) return;
    saveCustomColumn(customColFormData);
    setIsCustomColModalOpen(false);
  };

  // File Upload Handlers
  const handleJsonFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) importFullBackup(text);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) importCSV(text);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Email Test Handler
  const handleSendTestEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail || !testEmail.includes('@')) {
      showToast('Correo Inválido', 'Ingrese una dirección de correo válida.', 'error');
      return;
    }
    const subject = encodeURIComponent('Reporte de Prueba - FEX Pharmacy');
    const body = encodeURIComponent(
      `Hola,\n\nEste es un correo de prueba del sistema de gestión de sucursales FEX Pharmacy.\n` +
      `Generado el: ${new Date().toLocaleString('es-DO')}\n\n` +
      `Atentamente,\nEquipo de TI - FEX Pharmacy`
    );
    window.open(`mailto:${testEmail}?subject=${subject}&body=${body}`);
    showToast('Cliente de Correo', `Se abrió su cliente de correo para enviar a ${testEmail}`, 'info');
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm flex items-center gap-3">
        <div className="p-2.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-sm text-white uppercase tracking-wider">
            Configuración & Persistencia de Datos
          </h3>
          <p className="text-xs text-slate-400 font-mono">
            Personalice columnas de la tabla, campos dinámicos, vincule archivos CSV y gestione respaldos
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Default Column Order & Visibility */}
        <div className="lg:col-span-6 bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Table className="w-4 h-4 text-indigo-400" />
              <h4 className="font-bold text-xs text-white uppercase tracking-wider">
                Columnas Predeterminadas
              </h4>
            </div>
            <button
              onClick={handleSaveColumns}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg shadow-sm transition-all flex items-center gap-1.5 uppercase tracking-wider"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Guardar Orden</span>
            </button>
          </div>

          <div className="p-4 space-y-2 overflow-y-auto max-h-[460px]">
            {localOrder.map((key, idx) => {
              const cfg = localSettings[key] || { label: key, visible: true, locked: false };
              const isLocked = cfg.locked;

              return (
                <div key={key} className="flex items-center justify-between gap-3 p-2 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono">
                  
                  {/* Move buttons */}
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => handleMoveColumn(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 text-slate-500 hover:text-slate-200 disabled:opacity-30"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveColumn(idx, 'down')}
                      disabled={idx === localOrder.length - 1}
                      className="p-1 text-slate-500 hover:text-slate-200 disabled:opacity-30"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Visibility Checkbox */}
                  <input
                    type="checkbox"
                    checked={cfg.visible !== false}
                    disabled={isLocked}
                    onChange={() => handleToggleVisibility(key)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-700"
                  />

                  {/* Editable Label */}
                  <input
                    type="text"
                    value={cfg.label || ''}
                    onChange={(e) => handleLabelChange(key, e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 text-slate-200 rounded px-2.5 py-1 text-xs font-mono font-medium focus:border-indigo-500 focus:outline-none"
                  />

                  {isLocked && (
                    <span className="text-[10px] text-slate-500 italic">Obligatorio</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Custom Fields & File System Access */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Custom Fields Card */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-bold text-xs text-white uppercase tracking-wider">
                  Campos Personalizados Dinámicos
                </h4>
                <p className="text-xs text-slate-400 font-mono">
                  Defina columnas adicionales específicas para cada sucursal
                </p>
              </div>
              <button
                onClick={() => {
                  setCustomColFormData({ id: '', name: '', defaultValue: '' });
                  setIsCustomColModalOpen(true);
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm transition-all flex items-center gap-1 uppercase tracking-wider"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar Columna</span>
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {customColumns.length === 0 ? (
                <p className="text-xs text-slate-500 font-mono italic py-4 text-center">
                  No hay columnas personalizadas creadas aún.
                </p>
              ) : (
                customColumns.map(col => (
                  <div key={col.id} className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="font-bold text-white block">{col.name}</span>
                      <span className="text-slate-500 text-[10px]">Por defecto: {col.defaultValue || '—'}</span>
                    </div>
                    <button
                      onClick={() => deleteCustomColumn(col.id)}
                      className="p-1 text-rose-400 hover:text-rose-300 hover:bg-slate-800 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Local CSV File System Access API Card */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm p-4 space-y-4">
            <div>
              <h4 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
                Base de Datos CSV Local
              </h4>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Vincule un archivo <code className="text-indigo-400">.csv</code> local para lectura y sincronización.
              </p>
            </div>

            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono">
              {linkedCsvHandleName ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> Archivo Vinculado: "{linkedCsvHandleName}"
                </span>
              ) : (
                <span className="text-slate-500 font-medium">
                  Ningún archivo CSV vinculado en esta sesión.
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={linkLocalCsvFile}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg shadow-sm transition-all flex items-center gap-1.5 uppercase tracking-wider"
              >
                <Link className="w-3.5 h-3.5" />
                <span>Vincular Archivo CSV Local</span>
              </button>

              <button
                onClick={syncWithLinkedCsvNow}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 uppercase tracking-wider"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Releer CSV Ahora</span>
              </button>
            </div>

            <div className="pt-3 border-t border-slate-800 flex flex-wrap gap-2 text-xs">
              <button
                onClick={exportCSV}
                className="border border-slate-800 hover:bg-slate-800 font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-slate-300 font-mono"
              >
                <Download className="w-3.5 h-3.5" /> Exportar CSV
              </button>

              <label className="border border-slate-800 hover:bg-slate-800 font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-slate-300 font-mono cursor-pointer">
                <Upload className="w-3.5 h-3.5" /> Importar CSV
                <input type="file" accept=".csv" onChange={handleCsvFileUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Backup JSON Card */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm p-4 space-y-3">
            <h4 className="font-bold text-xs text-white uppercase tracking-wider">
              Copia de Seguridad Completa (JSON)
            </h4>
            <p className="text-xs text-slate-400 font-mono">
              Guarde o restaure todas las sucursales, zonas, provincias, columnas y registros.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={exportFullBackup}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg shadow-sm transition-all flex items-center gap-1.5 uppercase tracking-wider"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar Backup Completo</span>
              </button>

              <label className="border border-slate-800 hover:bg-slate-800 font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 text-slate-300 cursor-pointer font-mono uppercase tracking-wider">
                <Upload className="w-3.5 h-3.5" />
                <span>Restaurar Backup JSON</span>
                <input type="file" accept=".json" onChange={handleJsonFileUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Email Notification Test Card */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm p-4 space-y-3">
            <h4 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-400" />
              Prueba de Notificaciones por Correo
            </h4>
            <p className="text-xs text-slate-400 font-mono">
              Pruebe el envío de reportes automáticos vía cliente de correo.
            </p>

            <form onSubmit={handleSendTestEmail} className="flex gap-2">
              <input
                type="email"
                required
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="admin@fexpharmacy.com"
                className="flex-1 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono font-medium focus:border-indigo-500 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg shadow-sm transition-all uppercase tracking-wider"
              >
                Probar
              </button>
            </form>
          </div>

        </div>

      </div>

      {/* Custom Column Modal */}
      {isCustomColModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-2xl max-w-md w-full p-5 text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                Nueva Columna Personalizada
              </h3>
              <button onClick={() => setIsCustomColModalOpen(false)} className="text-slate-500 hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomColumn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Nombre de la Columna *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Observaciones de Conexión"
                  value={customColFormData.name}
                  onChange={(e) => setCustomColFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-medium focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Valor Predeterminado
                </label>
                <input
                  type="text"
                  placeholder="Ej: Pendiente"
                  value={customColFormData.defaultValue}
                  onChange={(e) => setCustomColFormData(prev => ({ ...prev, defaultValue: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-medium focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCustomColModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:bg-slate-800 uppercase tracking-wider"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-1.5 rounded-lg shadow-sm uppercase tracking-wider"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
