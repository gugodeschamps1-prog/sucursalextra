import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MapPin, Globe, Plus, Trash2, Edit2, X, Check, Store } from 'lucide-react';

export const ZonesAndProvinces: React.FC = () => {
  const {
    zones,
    provinces,
    branches,
    saveZone,
    deleteZone,
    saveProvince,
    deleteProvince
  } = useApp();

  // Modal State for Zone
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [zoneFormData, setZoneFormData] = useState({ id: '', name: '', color: '#10b981' });

  // Modal State for Province
  const [isProvinceModalOpen, setIsProvinceModalOpen] = useState(false);
  const [provinceFormData, setProvinceFormData] = useState({ id: '', name: '', zoneId: '' });

  const colorPresets = [
    '#10b981', // Emerald
    '#3b82f6', // Blue
    '#f59e0b', // Amber
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#06b6d4', // Cyan
    '#84cc16', // Lime
    '#f97316', // Orange
    '#64748b'  // Slate
  ];

  // Open Zone Form
  const handleOpenZoneModal = (zone?: any) => {
    if (zone) {
      setZoneFormData({ id: zone.id, name: zone.name, color: zone.color || '#10b981' });
    } else {
      setZoneFormData({ id: '', name: '', color: '#10b981' });
    }
    setIsZoneModalOpen(true);
  };

  const handleSaveZoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!zoneFormData.name.trim()) return;
    saveZone(zoneFormData);
    setIsZoneModalOpen(false);
  };

  // Open Province Form
  const handleOpenProvinceModal = (prov?: any) => {
    if (prov) {
      setProvinceFormData({ id: prov.id, name: prov.name, zoneId: prov.zoneId });
    } else {
      setProvinceFormData({ id: '', name: '', zoneId: zones[0]?.id || '' });
    }
    setIsProvinceModalOpen(true);
  };

  const handleSaveProvinceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!provinceFormData.name.trim() || !provinceFormData.zoneId) return;
    saveProvince(provinceFormData);
    setIsProvinceModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Zones List */}
        <div className="lg:col-span-5 bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-400" />
              <div>
                <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                  Zonas Regionales
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  Total: {zones.length} zonas configuradas
                </p>
              </div>
            </div>
            <button
              onClick={() => handleOpenZoneModal()}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm transition-all flex items-center gap-1 uppercase tracking-wider"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nueva Zona</span>
            </button>
          </div>

          <div className="divide-y divide-slate-800/60 overflow-y-auto max-h-[500px]">
            {zones.map(z => {
              const assignedProvs = provinces.filter(p => p.zoneId === z.id);
              const provIds = assignedProvs.map(p => p.id);
              const activeBranchCount = branches.filter(b => provIds.includes(b.provinceId) && b.status === 'active').length;

              return (
                <div key={z.id} className="p-3.5 flex items-center justify-between hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-4 h-4 rounded-full flex-shrink-0 shadow-sm border border-slate-700"
                      style={{ backgroundColor: z.color }}
                    />
                    <div>
                      <h4 className="font-bold text-xs text-white">
                        {z.name}
                      </h4>
                      <div className="flex items-center gap-2.5 text-[11px] text-slate-400 font-mono mt-0.5">
                        <span>{assignedProvs.length} prov.</span>
                        <span>•</span>
                        <span className="font-medium text-emerald-400 flex items-center gap-1">
                          <Store className="w-3 h-3" /> {activeBranchCount} activas
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenZoneModal(z)}
                      className="p-1 text-indigo-400 hover:text-indigo-300 hover:bg-slate-800 rounded transition-colors"
                      title="Editar Zona"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteZone(z.id)}
                      className="p-1 text-rose-400 hover:text-rose-300 hover:bg-slate-800 rounded transition-colors"
                      title="Eliminar Zona"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Provinces List */}
        <div className="lg:col-span-7 bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-400" />
              <div>
                <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                  Provincias
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  Total: {provinces.length} provincias asignadas
                </p>
              </div>
            </div>
            <button
              onClick={() => handleOpenProvinceModal()}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm transition-all flex items-center gap-1 uppercase tracking-wider"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nueva Provincia</span>
            </button>
          </div>

          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 backdrop-blur-sm text-slate-400 uppercase font-bold text-[10px] tracking-widest border-b border-slate-800">
                <tr>
                  <th className="px-4 py-2.5">Provincia</th>
                  <th className="px-4 py-2.5">Zona Asignada</th>
                  <th className="px-4 py-2.5 text-center font-mono">Sucursales</th>
                  <th className="px-4 py-2.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
                {provinces.map(p => {
                  const z = zones.find(zone => zone.id === p.zoneId);
                  const branchCount = branches.filter(b => b.provinceId === p.id).length;

                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-2.5 font-bold text-white">
                        {p.name}
                      </td>
                      <td className="px-4 py-2.5">
                        {z ? (
                          <span
                            className="inline-block px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-wider"
                            style={{ backgroundColor: z.color }}
                          >
                            {z.name}
                          </span>
                        ) : (
                          <span className="text-slate-500">Sin Zona</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-center font-mono font-bold text-slate-300">
                        {branchCount}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenProvinceModal(p)}
                            className="p-1 text-indigo-400 hover:text-indigo-300 hover:bg-slate-800 rounded transition-colors"
                            title="Editar Provincia"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteProvince(p.id)}
                            className="p-1 text-rose-400 hover:text-rose-300 hover:bg-slate-800 rounded transition-colors"
                            title="Eliminar Provincia"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Zone Modal */}
      {isZoneModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-2xl max-w-md w-full p-5 text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                {zoneFormData.id ? 'Editar Zona' : 'Nueva Zona Regional'}
              </h3>
              <button onClick={() => setIsZoneModalOpen(false)} className="text-slate-500 hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveZoneSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Nombre de la Zona *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Zona Norte"
                  value={zoneFormData.name}
                  onChange={(e) => setZoneFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-medium focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">
                  Color Identificador *
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {colorPresets.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setZoneFormData(prev => ({ ...prev, color: c }))}
                      className={`w-7 h-7 rounded-lg border-2 transition-transform ${
                        zoneFormData.color === c ? 'scale-110 border-indigo-500 shadow-md' : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsZoneModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:bg-slate-800 uppercase tracking-wider"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-1.5 rounded-lg shadow-sm uppercase tracking-wider"
                >
                  Guardar Zona
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Province Modal */}
      {isProvinceModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-2xl max-w-md w-full p-5 text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                {provinceFormData.id ? 'Editar Provincia' : 'Nueva Provincia'}
              </h3>
              <button onClick={() => setIsProvinceModalOpen(false)} className="text-slate-500 hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProvinceSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Nombre de la Provincia *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Santiago"
                  value={provinceFormData.name}
                  onChange={(e) => setProvinceFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-medium focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Zona Pertenece *
                </label>
                <select
                  required
                  value={provinceFormData.zoneId}
                  onChange={(e) => setProvinceFormData(prev => ({ ...prev, zoneId: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-medium focus:border-indigo-500 focus:outline-none"
                >
                  <option value="">Seleccione Zona...</option>
                  {zones.map(z => (
                    <option key={z.id} value={z.id}>{z.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProvinceModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:bg-slate-800 uppercase tracking-wider"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-1.5 rounded-lg shadow-sm uppercase tracking-wider"
                >
                  Guardar Provincia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
