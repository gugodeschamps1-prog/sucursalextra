import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Store,
  CheckCircle2,
  XCircle,
  MapPin,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  ShieldAlert,
  Server,
  Layers,
  Sparkles
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { SERVICE_KEYS } from '../lib/initialData';

export const Dashboard: React.FC = () => {
  const { branches, zones, provinces, setActiveTab, setFilters, setIsBranchModalOpen, setEditingBranch } = useApp();

  // 1. KPI Calculations
  const totalCount = branches.length;
  const activeCount = branches.filter(b => b.status === 'active').length;
  const closedCount = branches.filter(b => b.status === 'closed').length;
  const activePercentage = totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0;

  // 2. Service Compliance Calculation
  const incompleteBranches = useMemo(() => {
    return branches.filter(b => {
      // Check if any required service is 'NO', 'Solicitado', or empty
      return (
        b.backups !== 'SI' ||
        b.externalDisk !== 'SI' ||
        b.emailValidation !== 'SI' ||
        b.failOver !== 'SI'
      );
    });
  }, [branches]);

  const serviceCompliancePercentage = useMemo(() => {
    if (totalCount === 0) return 100;
    const completeCount = totalCount - incompleteBranches.length;
    return Math.round((completeCount / totalCount) * 100);
  }, [totalCount, incompleteBranches]);

  // 3. Zone Distribution Data for Recharts
  const zoneChartData = useMemo(() => {
    return zones.map(z => {
      const provIds = provinces.filter(p => p.zoneId === z.id).map(p => p.id);
      const count = branches.filter(b => provIds.includes(b.provinceId) && b.status === 'active').length;
      return {
        name: z.name,
        sucursales: count,
        color: z.color || '#3b82f6'
      };
    });
  }, [zones, provinces, branches]);

  // 4. Status Pie Chart Data
  const statusPieData = useMemo(() => {
    return [
      { name: 'Activas', value: activeCount, color: '#10b981' },
      { name: 'Cerradas', value: closedCount, color: '#f43f5e' }
    ];
  }, [activeCount, closedCount]);

  // 5. Monthly Evolution Data
  const monthlyData = useMemo(() => {
    const monthsMap: Record<string, number> = {};
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString('es-DO', { month: 'short' }) + ' ' + d.getFullYear();
      monthsMap[key] = 0;
    }

    branches.forEach(b => {
      if (b.createdAt) {
        const d = new Date(b.createdAt);
        const key = d.toLocaleString('es-DO', { month: 'short' }) + ' ' + d.getFullYear();
        if (monthsMap[key] !== undefined) {
          monthsMap[key] += 1;
        }
      }
    });

    return Object.entries(monthsMap).map(([mes, cantidad]) => ({ mes, cantidad }));
  }, [branches]);

  // 6. Service Flags Breakdown for Matrix
  const serviceMatrixData = useMemo(() => {
    const labels: Record<string, string> = {
      backups: 'BackUps',
      externalDisk: 'Disco Ext.',
      dataReduction: 'Reducc. Datos',
      emailValidation: 'Valid. Correos',
      ftp: 'FTP',
      s3: 'Subir a S3',
      voxelLog: 'VoxelLog',
      failOver: 'FailOver',
      voxel: 'Voxel',
      updateBox: 'Act. Caja',
      bkConsecutivo: 'BK Consec.'
    };

    return SERVICE_KEYS.map(key => {
      const activeCount = branches.filter(b => b[key] === 'SI').length;
      const rate = totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0;
      return {
        service: labels[key] || key,
        cobertura: rate,
        count: activeCount
      };
    });
  }, [branches, totalCount]);

  const recentBranches = useMemo(() => {
    return [...branches]
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 6);
  }, [branches]);

  const handleFilterIncomplete = () => {
    setFilters(prev => ({ ...prev, serviceFilter: 'incomplete' }));
    setActiveTab('branches');
  };

  const getProvinceName = (pId: string) => provinces.find(p => p.id === pId)?.name || 'Sin Provincia';
  const getZoneForProvince = (pId: string) => {
    const p = provinces.find(prov => prov.id === pId);
    if (!p) return null;
    return zones.find(z => z.id === p.zoneId);
  };

  return (
    <div className="space-y-5 pb-10">
      
      {/* Top Banner Greeting */}
      <div className="bg-slate-900 border border-slate-800 border-l-4 border-l-indigo-500 rounded-xl p-5 text-slate-200 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[10px] font-mono font-bold uppercase tracking-widest mb-2 border border-indigo-500/20">
              <Sparkles className="w-3 h-3 text-indigo-400" /> Sistema PWA FEX Pharmacy
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              Panel de Control de Sucursales
            </h2>
            <p className="text-slate-400 text-xs mt-1 max-w-2xl font-medium">
              Supervise el estado operacional, la cobertura por zona y el cumplimiento de respaldos y servidores en tiempo real.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setEditingBranch(null);
                setIsBranchModalOpen(true);
                setActiveTab('branches');
              }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-lg font-bold text-xs transition-all shadow-sm shadow-indigo-600/20 uppercase tracking-wider active:scale-95"
            >
              + Agregar Sucursal
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Total Branches Card */}
        <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Total Sucursales</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-mono font-bold text-white tracking-tight">{totalCount}</span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700/60 uppercase">
              {zones.length} ZONAS
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-medium">
            En {provinces.length} provincias del país
          </p>
        </div>

        {/* Active Branches Card */}
        <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Sucursales Activas</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-mono font-bold text-white tracking-tight">{activeCount}</span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase">
              {activePercentage}% OPERANDO
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-medium">
            En línea e interconectadas
          </p>
        </div>

        {/* Closed Branches Card */}
        <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Inactivas / Cerradas</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-mono font-bold text-white tracking-tight">{closedCount}</span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 uppercase">
              {totalCount > 0 ? Math.round((closedCount / totalCount) * 100) : 0}% FUERA
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-medium">
            Requieren revisión técnica
          </p>
        </div>

        {/* Service Compliance Card */}
        <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Salud de Servicios</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-mono font-bold text-white tracking-tight">{serviceCompliancePercentage}%</span>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase border ${incompleteBranches.length === 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-300 border-amber-500/30'}`}>
              {incompleteBranches.length} INCOMPLETAS
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-medium">
            Evaluación Backups & FailOver
          </p>
        </div>

      </div>

      {/* Incomplete Services Health Banner */}
      {incompleteBranches.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-300 rounded-lg flex-shrink-0 border border-amber-500/30">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-amber-200">
                ¡Atención! {incompleteBranches.length} sucursal(es) requieren configuración de servicios
              </h4>
              <p className="text-[11px] text-amber-300/80 mt-0.5 font-medium">
                Sucursales como <span className="font-semibold underline">{incompleteBranches.slice(0, 3).map(b => b.name).join(', ')}</span> tienen pendientes copias de respaldo o discos externos.
              </p>
            </div>
          </div>
          <button
            onClick={handleFilterIncomplete}
            className="whitespace-nowrap bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-all shadow-sm active:scale-95 flex items-center gap-1 uppercase tracking-wider"
          >
            <span>Ver Incompletas</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Zone Distribution Bar Chart */}
        <div className="lg:col-span-7 bg-slate-900 rounded-xl p-4 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                Distribución de Sucursales por Zona
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                Número de sucursales activas en cada región geográfica
              </p>
            </div>
            <div className="p-1.5 bg-slate-800 rounded-lg text-slate-400 border border-slate-700/60">
              <MapPin className="w-4 h-4" />
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={zoneChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" opacity={0.6} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px', fontFamily: 'monospace' }}
                  cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
                />
                <Bar dataKey="sucursales" radius={[4, 4, 0, 0]}>
                  {zoneChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Breakdown Pie Chart */}
        <div className="lg:col-span-5 bg-slate-900 rounded-xl p-4 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                  Estado Operacional
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">
                  Relación entre sucursales activas y cerradas
                </p>
              </div>
              <div className="p-1.5 bg-slate-800 rounded-lg text-slate-400 border border-slate-700/60">
                <Layers className="w-4 h-4" />
              </div>
            </div>

            <div className="h-44 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={72}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-pie-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px', fontFamily: 'monospace' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute text-center">
                <span className="text-xl font-mono font-bold text-white">{activePercentage}%</span>
                <span className="block text-[9px] font-bold uppercase text-slate-500 tracking-widest">Activas</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-6 pt-2.5 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span className="text-xs font-mono font-medium text-slate-300">Activas ({activeCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
              <span className="text-xs font-mono font-medium text-slate-300">Cerradas ({closedCount})</span>
            </div>
          </div>
        </div>

      </div>

      {/* Row 2: Monthly Progress & Service Flags Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Monthly Progress Area Chart */}
        <div className="lg:col-span-6 bg-slate-900 rounded-xl p-4 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                Evolución y Registros Mensuales
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                Nuevas sucursales incorporadas en los últimos 6 meses
              </p>
            </div>
            <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMonthly" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" opacity={0.6} />
                <XAxis dataKey="mes" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px', fontFamily: 'monospace' }}
                />
                <Area type="monotone" dataKey="cantidad" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorMonthly)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Service Flags Compliance Progress Bars */}
        <div className="lg:col-span-6 bg-slate-900 rounded-xl p-4 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                  Cobertura de Servicios TI
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">
                  Porcentaje de sucursales con cada servicio activo
                </p>
              </div>
              <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
                <Server className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {serviceMatrixData.map(item => (
                <div key={item.service} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300 font-medium">{item.service}</span>
                    <span className="text-indigo-400 font-mono text-[11px]">{item.cobertura}% ({item.count}/{totalCount})</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.cobertura >= 80 ? 'bg-emerald-500' : item.cobertura >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${item.cobertura}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Recent Activity Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              Últimas Sucursales Registradas
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              Sucursales agregadas recientemente al sistema
            </p>
          </div>
          <button
            onClick={() => setActiveTab('branches')}
            className="text-indigo-400 hover:text-indigo-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1"
          >
            <span>Ver Todas</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/50 text-slate-400 uppercase font-bold text-[10px] tracking-widest border-b border-slate-800">
              <tr>
                <th className="px-3.5 py-2.5">Sucursal</th>
                <th className="px-3.5 py-2.5">Provincia</th>
                <th className="px-3.5 py-2.5">Zona</th>
                <th className="px-3.5 py-2.5">Servidor</th>
                <th className="px-3.5 py-2.5">Estado</th>
                <th className="px-3.5 py-2.5">Fecha Reg.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
              {recentBranches.map(b => {
                const zone = getZoneForProvince(b.provinceId);
                return (
                  <tr key={b.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-3.5 py-2.5 font-bold text-white">
                      {b.name} <span className="text-slate-500 font-mono text-[11px] font-normal">({b.branchId ? `#${b.branchId}` : 'S/I'})</span>
                    </td>
                    <td className="px-3.5 py-2.5 text-slate-300">
                      {getProvinceName(b.provinceId)}
                    </td>
                    <td className="px-3.5 py-2.5">
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
                    <td className="px-3.5 py-2.5 font-mono text-[11px] text-slate-400">
                      {b.server || '—'}
                    </td>
                    <td className="px-3.5 py-2.5">
                      {b.status === 'active' ? (
                        <span className="inline-flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-bold text-[10px] uppercase">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Activa
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded font-mono font-bold text-[10px] uppercase">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> Cerrada
                        </span>
                      )}
                    </td>
                    <td className="px-3.5 py-2.5 text-slate-400 font-mono text-[11px]">
                      {b.createdAt ? new Date(b.createdAt).toLocaleDateString('es-DO') : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
