import React from 'react';
import { HelpCircle, Store, MapPin, Sliders, FileText, Smartphone, WifiOff, ShieldCheck } from 'lucide-react';

export const HelpView: React.FC = () => {
  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm flex items-center gap-3">
        <div className="p-2.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg">
          <HelpCircle className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-sm text-white uppercase tracking-wider">
            Guía de Uso del Sistema - FEX Pharmacy
          </h3>
          <p className="text-xs text-slate-400 font-mono">
            Instrucciones para gestionar sucursales, instalar PWA Chrome, alertas FCM y exportación
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
            <Store className="w-4 h-4" />
            <span>Gestión de Sucursales</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-mono text-[11px]">
            Registre, edite, suspenda o reactive sucursales. Asigne nombres de servidores, IPs locales y bases de datos SQL. En el formulario, despliegue el acordeón para configurar Backups, Disco Externo, FailOver, S3 y Voxel.
          </p>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
            <Smartphone className="w-4 h-4" />
            <span>PWA & Instalación Chrome</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-mono text-[11px]">
            La aplicación incluye Service Workers y Manifest Web App. Haga clic en el botón "Instalar App Chrome" en el encabezado para instalarla de forma nativa en su ordenador o dispositivo móvil.
          </p>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
            <WifiOff className="w-4 h-4" />
            <span>Modo Sin Conexión & Sincronización</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-mono text-[11px]">
            Todas las operaciones funcionan sin conexión a internet. Los cambios se guardan localmente y se reconectan automáticamente al recuperar la señal de red.
          </p>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
            <FileText className="w-4 h-4" />
            <span>Reportes PDF y Excel</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-mono text-[11px]">
            Desde la pestaña "Reportes Mensuales" seleccione cualquier mes y descargue reportes profesionales en formato PDF o Excel (.xlsx) listos para impresión.
          </p>
        </div>

      </div>

    </div>
  );
};
