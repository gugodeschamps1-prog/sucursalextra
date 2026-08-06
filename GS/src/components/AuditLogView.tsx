import React from 'react';
import { useApp } from '../context/AppContext';
import { History, Trash2, Clock, ShieldCheck } from 'lucide-react';

export const AuditLogView: React.FC = () => {
  const { auditLogs, clearAuditLogs } = useApp();

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white uppercase tracking-wider">
              Registro de Auditoría del Sistema
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Historial de cambios, creación de sucursales y sincronizaciones
            </p>
          </div>
        </div>

        {auditLogs.length > 0 && (
          <button
            onClick={() => {
              if (confirm('¿Vaciar todo el registro de auditoría?')) clearAuditLogs();
            }}
            className="bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 font-bold text-xs px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 uppercase tracking-wider"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Vaciar Registro</span>
          </button>
        )}
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 backdrop-blur-sm text-slate-400 uppercase font-bold text-[10px] tracking-widest border-b border-slate-800 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-2.5 w-44 font-mono">Fecha / Hora</th>
                <th className="px-4 py-2.5 w-48">Acción</th>
                <th className="px-4 py-2.5">Detalles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-slate-500">
                    <Clock className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    <p className="font-semibold text-sm text-slate-400">No hay actividades registradas</p>
                  </td>
                </tr>
              ) : (
                auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-2 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleString('es-DO')}
                    </td>
                    <td className="px-4 py-2 font-bold text-white whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 uppercase tracking-wider">
                        <ShieldCheck className="w-3 h-3 text-indigo-400" /> {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-slate-300 font-mono text-[11px] leading-relaxed">
                      {log.detail}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
