import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Edit, Server, ShieldCheck, Database, MapPin, Calendar, Activity } from 'lucide-react';

export const BranchPreviewModal: React.FC = () => {
  const {
    previewBranch,
    setPreviewBranch,
    setEditingBranch,
    setIsBranchModalOpen,
    zones,
    provinces,
    customColumns
  } = useApp();

  if (!previewBranch) return null;

  const province = provinces.find(p => p.id === previewBranch.provinceId);
  const zone = province ? zones.find(z => z.id === province.zoneId) : null;

  const handleEdit = () => {
    const target = previewBranch;
    setPreviewBranch(null);
    setEditingBranch(target);
    setIsBranchModalOpen(true);
  };

  const serviceBadges = [
    { label: 'BackUps', val: previewBranch.backups },
    { label: 'Disco Ext.', val: previewBranch.externalDisk },
    { label: 'Reducc. Datos', val: previewBranch.dataReduction },
    { label: 'Valid. Correos', val: previewBranch.emailValidation },
    { label: 'FTP', val: previewBranch.ftp },
    { label: 'Subir a S3', val: previewBranch.s3 },
    { label: 'VoxelLog', val: previewBranch.voxelLog },
    { label: 'FailOver', val: previewBranch.failOver },
    { label: 'Voxel', val: previewBranch.voxel },
    { label: 'Act. Caja', val: previewBranch.updateBox },
    { label: 'BK Consec.', val: previewBranch.bkConsecutivo },
  ];

  const getBadgeStyle = (val: string) => {
    switch (val?.toUpperCase()) {
      case 'SI': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'NO': return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'SOLICITADO': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default: return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-slate-900 rounded-xl border border-slate-800 shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden text-slate-200 transition-colors">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">
                  {previewBranch.name}
                </h3>
                {previewBranch.status === 'active' ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                    Activa
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 uppercase tracking-wider">
                    Cerrada
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-mono">
                ID: {previewBranch.branchId || '—'} | CC: {previewBranch.cc || '—'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setPreviewBranch(null)}
            className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Details Content */}
        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
          
          {/* Location & Server Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs font-mono">
            
            <div>
              <span className="text-slate-500 block font-semibold mb-0.5 flex items-center gap-1 text-[11px]">
                <MapPin className="w-3.5 h-3.5" /> Provincia
              </span>
              <span className="font-bold text-white text-xs">
                {province?.name || '—'}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block font-semibold mb-0.5 flex items-center gap-1 text-[11px]">
                <Activity className="w-3.5 h-3.5" /> Zona
              </span>
              {zone ? (
                <span
                  className="inline-block px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-sm"
                  style={{ backgroundColor: zone.color }}
                >
                  {zone.name}
                </span>
              ) : (
                <span className="font-bold text-slate-500">Sin Zona</span>
              )}
            </div>

            <div>
              <span className="text-slate-500 block font-semibold mb-0.5 flex items-center gap-1 text-[11px]">
                <Server className="w-3.5 h-3.5" /> Host Servidor
              </span>
              <span className="font-mono font-bold text-white">
                {previewBranch.server || '—'}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block font-semibold mb-0.5 text-[11px]">IP Local</span>
              <span className="font-mono font-bold text-white">
                {previewBranch.ip || '—'}
              </span>
            </div>

            <div className="col-span-2 sm:col-span-2">
              <span className="text-slate-500 block font-semibold mb-0.5 flex items-center gap-1 text-[11px]">
                <Database className="w-3.5 h-3.5" /> Base de Datos
              </span>
              <span className="font-mono font-bold text-white truncate block">
                {previewBranch.db || '—'}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block font-semibold mb-0.5 flex items-center gap-1 text-[11px]">
                <Calendar className="w-3.5 h-3.5" /> Registrada
              </span>
              <span className="font-bold text-white">
                {previewBranch.createdAt ? new Date(previewBranch.createdAt).toLocaleDateString('es-DO') : '—'}
              </span>
            </div>

          </div>

          {/* Infrastructure Services Grid */}
          <div>
            <h4 className="font-bold text-[10px] uppercase tracking-widest text-slate-400 mb-2.5 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              Estado de Servicios e Infraestructura
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {serviceBadges.map(item => (
                <div key={item.label} className="flex items-center justify-between p-2 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono">
                  <span className="font-semibold text-slate-400 text-[11px]">{item.label}</span>
                  <span className={`px-2 py-0.5 rounded font-bold text-[10px] border ${getBadgeStyle(item.val)}`}>
                    {item.val || '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Fields if any */}
          {customColumns.length > 0 && (
            <div>
              <h4 className="font-bold text-[10px] uppercase tracking-widest text-slate-400 mb-2">
                Campos Personalizados
              </h4>
              <div className="grid grid-cols-2 gap-2.5">
                {customColumns.map(col => (
                  <div key={col.id} className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono">
                    <span className="text-slate-500 block font-semibold text-[11px]">{col.name}</span>
                    <span className="font-bold text-slate-200">
                      {previewBranch.custom?.[col.id] || col.defaultValue || '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 flex items-center justify-between bg-slate-900">
          <button
            onClick={() => setPreviewBranch(null)}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:bg-slate-800 uppercase tracking-wider transition-colors"
          >
            Cerrar
          </button>
          <button
            onClick={handleEdit}
            className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-1.5 rounded-lg shadow-sm uppercase tracking-wider transition-all"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Editar Sucursal</span>
          </button>
        </div>

      </div>
    </div>
  );
};
