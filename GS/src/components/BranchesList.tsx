import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Eye,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Check,
  X,
  AlertTriangle
} from 'lucide-react';
import { Branch } from '../types';

export const BranchesList: React.FC = () => {
  const {
    branches,
    zones,
    provinces,
    customColumns,
    columnSettings,
    columnOrder,
    filters,
    setFilters,
    resetFilters,
    setEditingBranch,
    setIsBranchModalOpen,
    toggleBranchStatus,
    deleteBranch,
    setPreviewBranch
  } = useApp();

  // Filtered and Sorted Branches
  const filteredBranches = useMemo(() => {
    let list = [...branches];

    // Search filter
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(b =>
        (b.name || '').toLowerCase().includes(q) ||
        (b.branchId || '').toLowerCase().includes(q) ||
        (b.cc || '').toLowerCase().includes(q) ||
        (b.server || '').toLowerCase().includes(q) ||
        (b.ip || '').toLowerCase().includes(q) ||
        (b.db || '').toLowerCase().includes(q)
      );
    }

    // Zone filter
    if (filters.zoneId) {
      const provsInZone = provinces.filter(p => p.zoneId === filters.zoneId).map(p => p.id);
      list = list.filter(b => provsInZone.includes(b.provinceId));
    }

    // Province filter
    if (filters.provinceId) {
      list = list.filter(b => b.provinceId === filters.provinceId);
    }

    // Status filter
    if (filters.status) {
      list = list.filter(b => b.status === filters.status);
    }

    // Service Health Filter
    if (filters.serviceFilter === 'incomplete') {
      list = list.filter(b => (
        b.backups !== 'SI' ||
        b.externalDisk !== 'SI' ||
        b.emailValidation !== 'SI' ||
        b.failOver !== 'SI'
      ));
    }

    // Sorting
    if (filters.sortKey) {
      list.sort((a, b) => {
        let valA: any = (a as any)[filters.sortKey] || '';
        let valB: any = (b as any)[filters.sortKey] || '';

        if (filters.sortKey === 'province') {
          valA = provinces.find(p => p.id === a.provinceId)?.name || '';
          valB = provinces.find(p => p.id === b.provinceId)?.name || '';
        } else if (filters.sortKey === 'zone') {
          const provA = provinces.find(p => p.id === a.provinceId);
          const provB = provinces.find(p => p.id === b.provinceId);
          valA = zones.find(z => z.id === provA?.zoneId)?.name || '';
          valB = zones.find(z => z.id === provB?.zoneId)?.name || '';
        }

        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return filters.sortDir === 'asc' ? -1 : 1;
        if (valA > valB) return filters.sortDir === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return list;
  }, [branches, zones, provinces, filters]);

  const visibleKeys = useMemo(() => {
    return columnOrder.filter(key => !columnSettings[key] || columnSettings[key].visible !== false);
  }, [columnOrder, columnSettings]);

  const handleSortClick = (key: string) => {
    setFilters(prev => {
      if (prev.sortKey === key) {
        return { ...prev, sortDir: prev.sortDir === 'asc' ? 'desc' : 'asc' };
      }
      return { ...prev, sortKey: key, sortDir: 'asc' };
    });
  };

  const renderSortIcon = (key: string) => {
    if (filters.sortKey !== key) return <ArrowUpDown className="w-3 h-3 opacity-40 ml-1 inline" />;
    return filters.sortDir === 'asc' 
      ? <ArrowUp className="w-3 h-3 text-indigo-500 ml-1 inline" />
      : <ArrowDown className="w-3 h-3 text-indigo-500 ml-1 inline" />;
  };

  const getProvinceName = (pId: string) => provinces.find(p => p.id === pId)?.name || '—';
  const getZoneForProvince = (pId: string) => {
    const p = provinces.find(prov => prov.id === pId);
    if (!p) return null;
    return zones.find(z => z.id === p.zoneId);
  };

  const renderServiceBadge = (val: string) => {
    if (!val || val === '') return <span className="text-slate-600 font-mono">—</span>;
    const v = val.toUpperCase();
    if (v === 'SI') return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">SI</span>;
    if (v === 'NO') return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">NO</span>;
    if (v === 'SOLICITADO') return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">Solicitado</span>;
    return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700/60">NA</span>;
  };

  const handleEditBranch = (branch: Branch) => {
    setEditingBranch(branch);
    setIsBranchModalOpen(true);
  };

  return (
    <div className="space-y-4 pb-12">
      
      {/* Search & Filter Header Bar */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por Nombre, ID, CC, IP, Servidor o DB..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-xs font-mono font-medium text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Quick Add & Reset */}
          <div className="flex items-center gap-2">
            {(filters.search || filters.zoneId || filters.provinceId || filters.status || filters.serviceFilter !== 'all') && (
              <button
                onClick={resetFilters}
                className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all uppercase tracking-wider"
                title="Limpiar filtros"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Limpiar Filtros</span>
              </button>
            )}

            <button
              onClick={() => {
                setEditingBranch(null);
                setIsBranchModalOpen(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow-sm shadow-indigo-600/20 transition-all flex items-center gap-1.5 uppercase tracking-wider"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar Sucursal</span>
            </button>
          </div>

        </div>

        {/* Dropdown Filters Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-800 text-xs">
          
          {/* Zone Filter */}
          <div>
            <select
              value={filters.zoneId}
              onChange={(e) => setFilters(prev => ({ ...prev, zoneId: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-3 py-1.5 font-medium focus:border-indigo-500 focus:outline-none"
            >
              <option value="">Todas las Zonas</option>
              {zones.map(z => (
                <option key={z.id} value={z.id}>{z.name}</option>
              ))}
            </select>
          </div>

          {/* Province Filter */}
          <div>
            <select
              value={filters.provinceId}
              onChange={(e) => setFilters(prev => ({ ...prev, provinceId: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-3 py-1.5 font-medium focus:border-indigo-500 focus:outline-none"
            >
              <option value="">Todas las Provincias</option>
              {provinces.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-3 py-1.5 font-medium focus:border-indigo-500 focus:outline-none"
            >
              <option value="">Todos los Estados</option>
              <option value="active">Solo Activas</option>
              <option value="closed">Solo Cerradas</option>
            </select>
          </div>

          {/* Service Health Filter */}
          <div>
            <select
              value={filters.serviceFilter}
              onChange={(e) => setFilters(prev => ({ ...prev, serviceFilter: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-3 py-1.5 font-medium focus:border-indigo-500 focus:outline-none"
            >
              <option value="all">Todos los Servicios</option>
              <option value="incomplete">⚠️ Servicios Incompletos</option>
            </select>
          </div>

        </div>

        {/* Summary Counter Indicator */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 font-medium">
          <span>Mostrando <strong className="text-white font-mono">{filteredBranches.length}</strong> de <strong className="text-white font-mono">{branches.length}</strong> sucursales</span>
          <span className="hidden sm:inline italic text-slate-500">Doble clic en una fila para vista previa rápida</span>
        </div>
      </div>

      {/* Main Data Table Card */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[calc(100vh-280px)] overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            
            {/* Table Header */}
            <thead className="sticky top-0 z-20 bg-slate-800/90 backdrop-blur-sm text-slate-400 uppercase font-bold text-[10px] tracking-widest border-b border-slate-800 shadow-sm">
              <tr>
                <th className="px-3 py-2.5 sticky left-0 z-30 bg-slate-800 w-28 text-center border-r border-slate-700/60">
                  Acciones
                </th>
                <th className="px-3 py-2.5 w-10 text-center text-slate-500 font-mono">#</th>

                {visibleKeys.map(key => {
                  const label = columnSettings[key]?.label || key;
                  return (
                    <th
                      key={key}
                      onClick={() => handleSortClick(key)}
                      className="px-3 py-2.5 whitespace-nowrap cursor-pointer hover:bg-slate-700/60 transition-colors"
                    >
                      <span>{label}</span>
                      {renderSortIcon(key)}
                    </th>
                  );
                })}

                {customColumns.map(col => (
                  <th key={col.id} className="px-3 py-2.5 whitespace-nowrap text-indigo-400">
                    {col.name}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
              {filteredBranches.length === 0 ? (
                <tr>
                  <td colSpan={100} className="p-8 text-center text-slate-500">
                    <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    <p className="font-semibold text-sm text-slate-400">No se encontraron sucursales</p>
                    <p className="text-xs mt-1 text-slate-500">Pruebe ajustando los filtros o la búsqueda.</p>
                  </td>
                </tr>
              ) : (
                filteredBranches.map((branch, index) => {
                  const isClosed = branch.status === 'closed';
                  const zone = getZoneForProvince(branch.provinceId);

                  return (
                    <tr
                      key={branch.id}
                      onDoubleClick={() => setPreviewBranch(branch)}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isClosed ? 'bg-slate-950/40 opacity-70' : ''
                      }`}
                    >
                      {/* Sticky Actions Cell */}
                      <td className="px-2 py-2 sticky left-0 z-10 bg-slate-900 border-r border-slate-800 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setPreviewBranch(branch)}
                            className="p-1 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded transition-colors"
                            title="Vista Previa"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleEditBranch(branch)}
                            className="p-1 text-indigo-400 hover:text-indigo-300 hover:bg-slate-800 rounded transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => toggleBranchStatus(branch.id)}
                            className={`p-1 rounded transition-colors ${
                              branch.status === 'active'
                                ? 'text-amber-400 hover:bg-slate-800'
                                : 'text-emerald-400 hover:bg-slate-800'
                            }`}
                            title={branch.status === 'active' ? 'Marcar como Cerrada' : 'Marcar como Activa'}
                          >
                            {branch.status === 'active' ? <X className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`¿Eliminar la sucursal "${branch.name}"?`)) deleteBranch(branch.id);
                            }}
                            className="p-1 text-rose-400 hover:text-rose-300 hover:bg-slate-800 rounded transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Row Index */}
                      <td className="px-3 py-2 text-center text-slate-500 font-mono text-[11px]">
                        {index + 1}
                      </td>

                      {/* Dynamic Columns */}
                      {visibleKeys.map(key => {
                        switch (key) {
                          case 'name':
                            return (
                              <td key={key} className="px-3 py-2 font-bold text-white whitespace-nowrap">
                                <span className={isClosed ? 'line-through text-slate-500' : ''}>
                                  {branch.name}
                                </span>
                              </td>
                            );
                          case 'branchId':
                            return (
                              <td key={key} className="px-3 py-2 font-mono font-bold text-slate-300">
                                {branch.branchId || '—'}
                              </td>
                            );
                          case 'province':
                            return (
                              <td key={key} className="px-3 py-2 text-slate-300 whitespace-nowrap">
                                {getProvinceName(branch.provinceId)}
                              </td>
                            );
                          case 'zone':
                            return (
                              <td key={key} className="px-3 py-2 whitespace-nowrap">
                                {zone ? (
                                  <span
                                    className="inline-block px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-wider"
                                    style={{ backgroundColor: zone.color }}
                                  >
                                    {zone.name}
                                  </span>
                                ) : (
                                  <span className="text-slate-500">Sin Zona</span>
                                )}
                              </td>
                            );
                          case 'server':
                            return (
                              <td key={key} className="px-3 py-2 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                                {branch.server || '—'}
                              </td>
                            );
                          case 'cc':
                            return (
                              <td key={key} className="px-3 py-2 font-mono text-slate-400">
                                {branch.cc || '—'}
                              </td>
                            );
                          case 'ip':
                            return (
                              <td key={key} className="px-3 py-2 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                                {branch.ip || '—'}
                              </td>
                            );
                          case 'db':
                            return (
                              <td key={key} className="px-3 py-2 font-mono text-[11px] text-slate-400 max-w-xs truncate" title={branch.db}>
                                {branch.db || '—'}
                              </td>
                            );
                          case 'status':
                            return (
                              <td key={key} className="px-3 py-2 whitespace-nowrap">
                                {branch.status === 'active' ? (
                                  <span className="inline-flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-bold text-[10px] uppercase">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Activa
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded font-mono font-bold text-[10px] uppercase">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> Cerrada
                                  </span>
                                )}
                              </td>
                            );
                          case 'createdAt':
                            return (
                              <td key={key} className="px-3 py-2 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                                {branch.createdAt ? new Date(branch.createdAt).toLocaleDateString('es-DO') : '—'}
                              </td>
                            );
                          default:
                            return (
                              <td key={key} className="px-3 py-2 whitespace-nowrap">
                                {renderServiceBadge((branch as any)[key])}
                              </td>
                            );
                        }
                      })}

                      {/* Custom Columns Values */}
                      {customColumns.map(col => (
                        <td key={col.id} className="px-3 py-2 text-slate-300 whitespace-nowrap font-mono text-xs">
                          {branch.custom?.[col.id] || col.defaultValue || '—'}
                        </td>
                      ))}

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
