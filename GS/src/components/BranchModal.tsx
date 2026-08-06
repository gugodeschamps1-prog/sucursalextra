import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ServiceValue, SimpleServiceValue } from '../types';
import { X, Save, Copy, ChevronDown, ChevronUp, Server, ShieldCheck, PlusCircle } from 'lucide-react';

export const BranchModal: React.FC = () => {
  const {
    editingBranch,
    isBranchModalOpen,
    setIsBranchModalOpen,
    saveBranch,
    zones,
    provinces,
    customColumns,
    applyServicesToAllBranches
  } = useApp();

  // Form State
  const [formData, setFormData] = useState<any>({
    name: '',
    branchId: '',
    cc: '',
    provinceId: '',
    server: '',
    ip: '',
    db: '',
    status: 'active',
    backups: 'SI',
    externalDisk: 'SI',
    dataReduction: 'SI',
    emailValidation: 'SI',
    ftp: 'SI',
    s3: 'SI',
    voxelLog: 'SI',
    failOver: 'SI',
    voxel: 'SI',
    updateBox: 'SI',
    bkConsecutivo: 'NO',
    custom: {}
  });

  const [isServicesAccordionOpen, setIsServicesAccordionOpen] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (editingBranch) {
      setFormData({
        id: editingBranch.id,
        name: editingBranch.name || '',
        branchId: editingBranch.branchId || '',
        cc: editingBranch.cc || '',
        provinceId: editingBranch.provinceId || '',
        server: editingBranch.server || '',
        ip: editingBranch.ip || '',
        db: editingBranch.db || '',
        status: editingBranch.status || 'active',
        backups: editingBranch.backups || 'SI',
        externalDisk: editingBranch.externalDisk || 'SI',
        dataReduction: editingBranch.dataReduction || 'SI',
        emailValidation: editingBranch.emailValidation || 'SI',
        ftp: editingBranch.ftp || 'SI',
        s3: editingBranch.s3 || 'SI',
        voxelLog: editingBranch.voxelLog || 'SI',
        failOver: editingBranch.failOver || 'SI',
        voxel: editingBranch.voxel || 'SI',
        updateBox: editingBranch.updateBox || 'SI',
        bkConsecutivo: editingBranch.bkConsecutivo || 'NO',
        custom: editingBranch.custom || {}
      });
    } else {
      setFormData({
        name: '',
        branchId: '',
        cc: '',
        provinceId: provinces[0]?.id || '',
        server: '',
        ip: '',
        db: '',
        status: 'active',
        backups: 'SI',
        externalDisk: 'SI',
        dataReduction: 'SI',
        emailValidation: 'SI',
        ftp: 'SI',
        s3: 'SI',
        voxelLog: 'SI',
        failOver: 'SI',
        voxel: 'SI',
        updateBox: 'SI',
        bkConsecutivo: 'NO',
        custom: {}
      });
    }
    setErrorMsg(null);
  }, [editingBranch, isBranchModalOpen, provinces]);

  if (!isBranchModalOpen) return null;

  // Selected Province -> Calculated Zone
  const selectedProvince = provinces.find(p => p.id === formData.provinceId);
  const calculatedZone = selectedProvince ? zones.find(z => z.id === selectedProvince.zoneId) : null;

  const handleInputChange = (field: string, val: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: val }));
    setErrorMsg(null);
  };

  const handleCustomFieldChange = (colId: string, val: string) => {
    setFormData((prev: any) => ({
      ...prev,
      custom: { ...prev.custom, [colId]: val }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = saveBranch(formData);
    if (!res.success) {
      setErrorMsg(res.message);
    } else {
      setIsBranchModalOpen(false);
    }
  };

  const handleApplyServicesToAll = () => {
    if (editingBranch && editingBranch.id) {
      if (confirm(`¿Está seguro de aplicar la configuración de servicios de "${formData.name}" a TODAS las sucursales del sistema?`)) {
        applyServicesToAllBranches(editingBranch.id);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="relative bg-slate-900 rounded-xl border border-slate-800 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-200 transition-colors">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                {editingBranch ? `Editar Sucursal: ${editingBranch.name}` : 'Registrar Nueva Sucursal'}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Complete la información básica, conectividad e infraestructura de servicios
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsBranchModalOpen(false)}
            className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">

          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-lg text-xs font-mono font-bold">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Section 1: Basic Information */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-800 pb-1.5">
              Información Principal
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              
              {/* Branch Name */}
              <div className="sm:col-span-6">
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Nombre de la Sucursal *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Centro Historico"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-medium focus:border-indigo-500 focus:outline-none transition-all"
                />
              </div>

              {/* Branch ID */}
              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  ID Sucursal
                </label>
                <input
                  type="text"
                  placeholder="Ej: 3"
                  value={formData.branchId}
                  onChange={(e) => handleInputChange('branchId', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-medium focus:border-indigo-500 focus:outline-none transition-all"
                />
              </div>

              {/* CC */}
              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Centro Costo (CC)
                </label>
                <input
                  type="text"
                  placeholder="Ej: 3"
                  value={formData.cc}
                  onChange={(e) => handleInputChange('cc', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-medium focus:border-indigo-500 focus:outline-none transition-all"
                />
              </div>

              {/* Province Select */}
              <div className="sm:col-span-6">
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Provincia *
                </label>
                <select
                  required
                  value={formData.provinceId}
                  onChange={(e) => handleInputChange('provinceId', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-medium focus:border-indigo-500 focus:outline-none transition-all"
                >
                  <option value="">Seleccione una provincia...</option>
                  {provinces.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Calculated Zone (Read Only) */}
              <div className="sm:col-span-6">
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Zona Regional (Asignación Automática)
                </label>
                <div className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono font-semibold flex items-center justify-between">
                  {calculatedZone ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: calculatedZone.color }} />
                      <span className="text-slate-200">{calculatedZone.name}</span>
                    </span>
                  ) : (
                    <span className="text-slate-500 font-normal">Seleccione provincia primero...</span>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Section 2: Technical Connectivity */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-800 pb-1.5">
              Conectividad & Servidor
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              
              {/* Server Hostname */}
              <div className="sm:col-span-6">
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Nombre Servidor Host
                </label>
                <input
                  type="text"
                  placeholder="Ej: ST-CEHIST-SV-PS"
                  value={formData.server}
                  onChange={(e) => handleInputChange('server', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-medium focus:border-indigo-500 focus:outline-none transition-all"
                />
              </div>

              {/* IP Address */}
              <div className="sm:col-span-6">
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Dirección IP Local
                </label>
                <input
                  type="text"
                  placeholder="Ej: 192.168.22.204"
                  value={formData.ip}
                  onChange={(e) => handleInputChange('ip', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-medium focus:border-indigo-500 focus:outline-none transition-all"
                />
              </div>

              {/* Database Name */}
              <div className="sm:col-span-8">
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Nombre Base de Datos SQL
                </label>
                <input
                  type="text"
                  placeholder="Ej: FEXPharmacySoftRDPtoVtaSuc3"
                  value={formData.db}
                  onChange={(e) => handleInputChange('db', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-medium focus:border-indigo-500 focus:outline-none transition-all"
                />
              </div>

              {/* Status */}
              <div className="sm:col-span-4">
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Estado de la Sucursal
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-semibold focus:border-indigo-500 focus:outline-none transition-all"
                >
                  <option value="active">Activa / Operando</option>
                  <option value="closed">Inactiva / Cerrada</option>
                </select>
              </div>

            </div>
          </div>

          {/* Section 3: Services Accordion */}
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
            <button
              type="button"
              onClick={() => setIsServicesAccordionOpen(prev => !prev)}
              className="w-full flex items-center justify-between p-3.5 bg-slate-950 text-left font-bold text-xs uppercase tracking-wider text-white transition-colors"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>Configuración de Servicios e Infraestructura</span>
              </div>
              {isServicesAccordionOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {isServicesAccordionOpen && (
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs font-mono">
                  
                  {/* Backups */}
                  <div>
                    <label className="block font-semibold text-slate-400 mb-1 text-[11px]">BackUps</label>
                    <select
                      value={formData.backups}
                      onChange={(e) => handleInputChange('backups', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg p-1.5 font-medium"
                    >
                      <option value="SI">SI</option>
                      <option value="NO">NO</option>
                      <option value="Solicitado">Solicitado</option>
                      <option value="NA">NA</option>
                    </select>
                  </div>

                  {/* External Disk */}
                  <div>
                    <label className="block font-semibold text-slate-400 mb-1 text-[11px]">Disco Externo</label>
                    <select
                      value={formData.externalDisk}
                      onChange={(e) => handleInputChange('externalDisk', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg p-1.5 font-medium"
                    >
                      <option value="SI">SI</option>
                      <option value="NO">NO</option>
                      <option value="Solicitado">Solicitado</option>
                      <option value="NA">NA</option>
                    </select>
                  </div>

                  {/* Data Reduction */}
                  <div>
                    <label className="block font-semibold text-slate-400 mb-1 text-[11px]">Reducción Datos</label>
                    <select
                      value={formData.dataReduction}
                      onChange={(e) => handleInputChange('dataReduction', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg p-1.5 font-medium"
                    >
                      <option value="SI">SI</option>
                      <option value="NO">NO</option>
                      <option value="NA">NA</option>
                    </select>
                  </div>

                  {/* Email Validation */}
                  <div>
                    <label className="block font-semibold text-slate-400 mb-1 text-[11px]">Validación Correos</label>
                    <select
                      value={formData.emailValidation}
                      onChange={(e) => handleInputChange('emailValidation', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg p-1.5 font-medium"
                    >
                      <option value="SI">SI</option>
                      <option value="NO">NO</option>
                      <option value="NA">NA</option>
                    </select>
                  </div>

                  {/* FTP */}
                  <div>
                    <label className="block font-semibold text-slate-400 mb-1 text-[11px]">Servidor FTP</label>
                    <select
                      value={formData.ftp}
                      onChange={(e) => handleInputChange('ftp', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg p-1.5 font-medium"
                    >
                      <option value="SI">SI</option>
                      <option value="NO">NO</option>
                    </select>
                  </div>

                  {/* S3 Upload */}
                  <div>
                    <label className="block font-semibold text-slate-400 mb-1 text-[11px]">Subir a S3 Cloud</label>
                    <select
                      value={formData.s3}
                      onChange={(e) => handleInputChange('s3', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg p-1.5 font-medium"
                    >
                      <option value="SI">SI</option>
                      <option value="NO">NO</option>
                    </select>
                  </div>

                  {/* Voxel Log Analyzer */}
                  <div>
                    <label className="block font-semibold text-slate-400 mb-1 text-[11px]">VoxelLogAnalyzer</label>
                    <select
                      value={formData.voxelLog}
                      onChange={(e) => handleInputChange('voxelLog', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg p-1.5 font-medium"
                    >
                      <option value="SI">SI</option>
                      <option value="NO">NO</option>
                      <option value="NA">NA</option>
                    </select>
                  </div>

                  {/* FailOver */}
                  <div>
                    <label className="block font-semibold text-slate-400 mb-1 text-[11px]">FailOver Redudante</label>
                    <select
                      value={formData.failOver}
                      onChange={(e) => handleInputChange('failOver', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg p-1.5 font-medium"
                    >
                      <option value="SI">SI</option>
                      <option value="NO">NO</option>
                      <option value="NA">NA</option>
                    </select>
                  </div>

                  {/* Voxel */}
                  <div>
                    <label className="block font-semibold text-slate-400 mb-1 text-[11px]">Voxel Integrado</label>
                    <select
                      value={formData.voxel}
                      onChange={(e) => handleInputChange('voxel', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg p-1.5 font-medium"
                    >
                      <option value="SI">SI</option>
                      <option value="NO">NO</option>
                    </select>
                  </div>

                  {/* Update Box */}
                  <div>
                    <label className="block font-semibold text-slate-400 mb-1 text-[11px]">Actualizar Caja</label>
                    <select
                      value={formData.updateBox}
                      onChange={(e) => handleInputChange('updateBox', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg p-1.5 font-medium"
                    >
                      <option value="SI">SI</option>
                      <option value="NO">NO</option>
                    </select>
                  </div>

                  {/* BK Consecutivo */}
                  <div>
                    <label className="block font-semibold text-slate-400 mb-1 text-[11px]">BK Consecutivo</label>
                    <select
                      value={formData.bkConsecutivo}
                      onChange={(e) => handleInputChange('bkConsecutivo', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg p-1.5 font-medium"
                    >
                      <option value="SI">SI</option>
                      <option value="NO">NO</option>
                      <option value="NA">NA</option>
                    </select>
                  </div>

                </div>

                {editingBranch && editingBranch.id && (
                  <div className="pt-2 border-t border-slate-800 flex justify-end">
                    <button
                      type="button"
                      onClick={handleApplyServicesToAll}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold transition-all uppercase tracking-wider"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Aplicar esta configuración a TODAS las sucursales</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 4: Custom Columns */}
          {customColumns.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
                <PlusCircle className="w-3.5 h-3.5 text-indigo-400" />
                Campos Personalizados
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {customColumns.map(col => (
                  <div key={col.id}>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      {col.name}
                    </label>
                    <input
                      type="text"
                      placeholder={col.defaultValue || 'Sin valor'}
                      value={formData.custom?.[col.id] || ''}
                      onChange={(e) => handleCustomFieldChange(col.id, e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-medium focus:border-indigo-500 focus:outline-none transition-all"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Form Actions Footer */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsBranchModalOpen(false)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:bg-slate-800 uppercase tracking-wider transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-1.5 rounded-lg shadow-sm uppercase tracking-wider transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Guardar Sucursal</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
