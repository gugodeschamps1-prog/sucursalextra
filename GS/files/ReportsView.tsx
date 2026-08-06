import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { FileText, FileSpreadsheet, Download, Calendar, CheckCircle2, XCircle, Store, Layers, Image } from 'lucide-react';
import { generatePDFReport, generateExcelReport } from '../lib/exportUtils';

export const ReportsView: React.FC = () => {
  const {
    branches,
    zones,
    provinces,
    customColumns,
    columnSettings,
    columnOrder
  } = useApp();

  const now = new Date();
  const defaultMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState<string>(defaultMonthStr);
  const [selectedProvince, setSelectedProvince] = useState<string>('all'); // NEW: Province selector

  // Filter branches created up to or during selected month AND by selected province
  const reportBranches = useMemo(() => {
    let filtered = branches;
    
    // Apply month filter
    if (selectedMonth) {
      const [year, month] = selectedMonth.split('-').map(Number);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      filtered = filtered.filter(b => {
        if (!b.createdAt) return true;
        return new Date(b.createdAt) <= endDate;
      });
    }

    // Apply province filter (NEW)
    if (selectedProvince !== 'all') {
      filtered = filtered.filter(b => b.provinceId === selectedProvince);
    }

    return filtered;
  }, [branches, selectedMonth, selectedProvince]);

  const monthNewBranches = useMemo(() => {
    if (!selectedMonth) return [];
    const [year, month] = selectedMonth.split('-').map(Number);

    let filtered = branches.filter(b => {
      if (!b.createdAt) return false;
      const d = new Date(b.createdAt);
      return d.getFullYear() === year && (d.getMonth() + 1) === month;
    });

    // Apply province filter (NEW)
    if (selectedProvince !== 'all') {
      filtered = filtered.filter(b => b.provinceId === selectedProvince);
    }

    return filtered;
  }, [branches, selectedMonth, selectedProvince]);

  const activeCount = reportBranches.filter(b => b.status === 'active').length;
  const closedCount = reportBranches.filter(b => b.status === 'closed').length;

  const handleExportPDF = () => {
    generatePDFReport({
      branches: reportBranches,
      zones,
      provinces,
      customColumns,
      columnSettings,
      columnOrder,
      selectedMonth,
      selectedProvince: selectedProvince !== 'all' ? selectedProvince : undefined
    });
  };

  const handleExportExcel = () => {
    generateExcelReport({
      branches: reportBranches,
      zones,
      provinces,
      customColumns,
      columnSettings,
      columnOrder,
      selectedMonth,
      selectedProvince: selectedProvince !== 'all' ? selectedProvince : undefined
    });
  };

  const getProvinceName = (pId: string) => provinces.find(p => p.id === pId)?.name || '—';
  const getZoneForProvince = (pId: string) => {
    const p = provinces.find(prov => prov.id === pId);
    if (!p) return null;
    return zones.find(z => z.id === p.zoneId);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Controls Header */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white uppercase tracking-wider">
              Reportes Mensuales Consolidados
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Exporte el historial técnico e infraestructura en PDF o Excel
            </p>
          </div>
        </div>

        {/* Month Selector, Province Selector & Export Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent focus:outline-none text-slate-200 font-bold"
            />
          </div>

          {/* NEW: Province Selector */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono">
            <Store className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              className="bg-transparent focus:outline-none text-slate-200 font-bold border-none"
            >
              <option value="all">Todas las Provincias</option>
              {provinces.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExportPDF}
            className="bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg shadow-sm transition-all flex items-center gap-1.5 uppercase tracking-wider active:scale-95"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>PDF</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg shadow-sm transition-all flex items-center gap-1.5 uppercase tracking-wider active:scale-95"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Excel</span>
          </button>

        </div>
      </div>

      {/* Report Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg">
            <Store className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block">Total en Período</span>
            <span className="text-xl font-bold font-mono text-white">{reportBranches.length}</span>
          </div>
        </div>

        <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block">Operando (Activas)</span>
            <span className="text-xl font-bold font-mono text-emerald-400">{activeCount}</span>
          </div>
        </div>

        <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg">
            <XCircle className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block">Inactivas / Cerradas</span>
            <span className="text-xl font-bold font-mono text-rose-400">{closedCount}</span>
          </div>
        </div>

        <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-lg">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block">Registradas en el Mes</span>
            <span className="text-xl font-bold font-mono text-white">{monthNewBranches.length}</span>
          </div>
        </div>

      </div>

      {/* Live Preview Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h4 className="font-bold text-xs text-white uppercase tracking-wider">
            Vista Previa de la Tabla del Reporte
          </h4>
          <span className="text-xs font-mono text-slate-400">
            {reportBranches.length} registros
          </span>
        </div>

        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 backdrop-blur-sm text-slate-400 uppercase font-bold text-[10px] tracking-widest border-b border-slate-800 sticky top-0 z-10">
              <tr>
                <th className="px-3 py-2.5 w-10 text-center font-mono">#</th>
                <th className="px-4 py-2.5">Sucursal</th>
                <th className="px-4 py-2.5">Provincia</th>
                <th className="px-4 py-2.5">Zona</th>
                <th className="px-4 py-2.5 font-mono">Servidor</th>
                <th className="px-4 py-2.5 font-mono">IP</th>
                <th className="px-4 py-2.5">BackUps</th>
                <th className="px-4 py-2.5">Estado</th>
                <th className="px-4 py-2.5 font-mono">Fecha Reg.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
              {reportBranches.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-500">
                    No existen sucursales registradas para el período seleccionado.
                  </td>
                </tr>
              ) : (
                reportBranches.map((b, idx) => {
                  const zone = getZoneForProvince(b.provinceId);
                  return (
                    <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-3 py-2 text-center text-slate-500 font-mono text-[11px]">{idx + 1}</td>
                      <td className="px-4 py-2 font-bold text-white whitespace-nowrap">
                        {b.name} <span className="text-slate-500 font-mono text-[11px]">({b.branchId ? `#${b.branchId}` : 'S/I'})</span>
                      </td>
                      <td className="px-4 py-2 text-slate-300 whitespace-nowrap">
                        {getProvinceName(b.provinceId)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {zone ? (
                          <span
                            className="inline-block px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-wider"
                            style={{ backgroundColor: zone.color }}
                          >
                            {zone.name}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-2 font-mono text-[11px] text-slate-400 whitespace-nowrap">{b.server || '—'}</td>
                      <td className="px-4 py-2 font-mono text-[11px] text-slate-400 whitespace-nowrap">{b.ip || '—'}</td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                          b.backups === 'SI' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}>
                          {b.backups}
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {b.status === 'active' ? (
                          <span className="text-emerald-400 font-mono font-bold text-[10px] uppercase">Activa</span>
                        ) : (
                          <span className="text-rose-400 font-mono font-bold text-[10px] uppercase">Cerrada</span>
                        )}
                      </td>
                      <td className="px-4 py-2 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        {b.createdAt ? new Date(b.createdAt).toLocaleDateString('es-DO') : '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
