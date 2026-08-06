import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bell, Send, CheckCircle2, AlertTriangle, Info, Trash2, Smartphone, ShieldCheck, Check } from 'lucide-react';

export const NotificationsCenter: React.FC = () => {
  const {
    notifications,
    fcmToken,
    requestNotificationAccess,
    sendSimulatedPushNotification,
    markNotificationRead,
    clearAllNotifications
  } = useApp();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [type, setType] = useState<'info' | 'warning' | 'success' | 'alert'>('info');

  const handleSendTestPush = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    sendSimulatedPushNotification(title, body, type);
    setTitle('');
    setBody('');
  };

  const getNotifIcon = (t: string) => {
    switch (t) {
      case 'success': return <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />;
      case 'alert': return <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0" />;
      default: return <Info className="w-5 h-5 text-indigo-500 flex-shrink-0" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* FCM Status Banner */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
              Firebase Cloud Messaging (FCM) & Alertas Push
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Notificaciones en tiempo real para cambios de estado, alertas y mantenimiento.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {fcmToken ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>FCM Activo</span>
            </span>
          ) : (
            <button
              onClick={requestNotificationAccess}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg shadow-sm transition-all flex items-center gap-1.5 uppercase tracking-wider"
            >
              <Smartphone className="w-4 h-4" />
              <span>Activar Permisos Push FCM</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Test Push Notification Form */}
        <div className="lg:col-span-5 bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm">
          <h4 className="font-bold text-xs text-white uppercase tracking-wider mb-1 flex items-center gap-2">
            <Send className="w-3.5 h-3.5 text-indigo-400" />
            Enviar Alerta Push de Prueba
          </h4>
          <p className="text-xs text-slate-400 font-mono mb-4">
            Simula el envío de una notificación push FCM en tiempo real.
          </p>

          <form onSubmit={handleSendTestPush} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Título de la Alerta *
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Mantenimiento Servidor Sucursal #3"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-medium focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Mensaje de la Alerta *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Ej: Se ha completado el respaldo de la base de datos SQL exitosamente."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-medium focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Tipo de Alerta
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-medium focus:border-indigo-500 focus:outline-none"
              >
                <option value="info">Información General (Azul)</option>
                <option value="success">Completado / Éxito (Verde)</option>
                <option value="warning">Advertencia (Naranja)</option>
                <option value="alert">Alerta Crítica / Error (Rojo)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Emitir Alerta Push FCM</span>
            </button>
          </form>
        </div>

        {/* Right Column: Notification History Stream */}
        <div className="lg:col-span-7 bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-xs text-white uppercase tracking-wider">
                Bandeja de Notificaciones ({notifications.length})
              </h4>
              <p className="text-xs text-slate-400 font-mono">
                Historial de alertas recibidas en esta sesión
              </p>
            </div>

            {notifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors text-xs font-bold uppercase tracking-wider flex items-center gap-1"
                title="Limpiar Notificaciones"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Vaciar</span>
              </button>
            )}
          </div>

          <div className="p-4 space-y-2.5 overflow-y-auto max-h-[420px] flex-1">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Bell className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                <p className="font-semibold text-sm text-slate-400">No hay notificaciones push aún</p>
                <p className="text-xs mt-1 text-slate-500 font-mono">Use el formulario de la izquierda para emitir alertas de prueba.</p>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  className={`p-3 rounded-lg border transition-all flex items-start gap-3 ${
                    n.read
                      ? 'bg-slate-950/40 border-slate-800/60 opacity-70'
                      : 'bg-slate-950 border-slate-800 shadow-sm'
                  }`}
                >
                  {getNotifIcon(n.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-xs text-white leading-tight">
                        {n.title}
                      </h5>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(n.timestamp).toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed font-mono text-[11px]">
                      {n.body}
                    </p>
                  </div>
                  {!n.read && (
                    <button
                      onClick={() => markNotificationRead(n.id)}
                      className="p-1 text-slate-500 hover:text-indigo-400 rounded"
                      title="Marcar como leída"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
