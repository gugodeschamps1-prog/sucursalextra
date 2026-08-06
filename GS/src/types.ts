export type ServiceValue = 'SI' | 'NO' | 'Solicitado' | 'NA';
export type SimpleServiceValue = 'SI' | 'NO';
export type BranchStatus = 'active' | 'closed';

export interface ServiceFlags {
  backups: ServiceValue;
  externalDisk: ServiceValue;
  dataReduction: ServiceValue;
  emailValidation: ServiceValue;
  ftp: SimpleServiceValue;
  s3: SimpleServiceValue;
  voxelLog: ServiceValue;
  failOver: ServiceValue;
  voxel: SimpleServiceValue;
  updateBox: SimpleServiceValue;
  bkConsecutivo: ServiceValue;
}

export interface Branch extends ServiceFlags {
  id: string;
  branchId: string; // e.g. "3"
  name: string; // e.g. "Centro Historico"
  provinceId: string;
  server: string; // e.g. "ST-CEHIST-SV-PS"
  cc: string; // e.g. "3"
  ip: string; // e.g. "192.168.22.204"
  db: string; // e.g. "FEXPharmacySoftRDPtoVtaSuc3"
  status: BranchStatus;
  createdAt: string; // ISO string
  updatedAt?: string;
  custom?: Record<string, string>; // custom columns values
}

export interface Zone {
  id: string;
  name: string;
  color: string; // hex string e.g. "#4CAF50"
}

export interface Province {
  id: string;
  name: string;
  zoneId: string;
}

export interface CustomColumn {
  id: string;
  name: string;
  defaultValue?: string;
}

export interface ColumnSetting {
  key: string;
  label: string;
  visible: boolean;
  locked?: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  detail: string;
}

export interface PushNotificationItem {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'alert';
  branchId?: string;
}

export interface AppFilters {
  search: string;
  zoneId: string;
  provinceId: string;
  status: string;
  serviceFilter: string; // "all" | "incomplete" | "complete"
  sortKey: string;
  sortDir: 'asc' | 'desc';
}
