import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Branch, Zone, Province, CustomColumn, ColumnSetting } from '../types';
import { DEFAULT_COLUMN_DEFS } from './initialData';

interface ExportDataOptions {
  branches: Branch[];
  zones: Zone[];
  provinces: Province[];
  customColumns: CustomColumn[];
  columnSettings: Record<string, ColumnSetting>;
  columnOrder: string[];
  selectedMonth?: string; // YYYY-MM
  selectedProvince?: string; // NEW: Province ID filter
}

export function generatePDFReport(options: ExportDataOptions) {
  const { branches, zones, provinces, customColumns, columnSettings, columnOrder, selectedMonth, selectedProvince } = options;
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  const dateStr = new Date().toLocaleString('es-DO', { dateStyle: 'medium', timeStyle: 'short' });
  const monthTitle = selectedMonth ? ` - Período ${selectedMonth}` : '';
  const provinceFilter = selectedProvince ? provinces.find(p => p.id === selectedProvince)?.name : null;
  const provinceTitle = provinceFilter ? ` - ${provinceFilter}` : '';

  // Header Banner
  doc.setFillColor(26, 35, 126); // #1a237e FEX primary blue
  doc.rect(0, 0, 297, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('FEX Pharmacy - Reporte General de Sucursales' + monthTitle + provinceTitle, 14, 14);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generado: ${dateStr} | Total Sucursales: ${branches.length}`, 200, 14, { align: 'right' });

  // Get visible default columns
  const visibleKeys = columnOrder.filter(key => !columnSettings[key] || columnSettings[key].visible !== false);
  
  const headers = ['#'];
  visibleKeys.forEach(key => {
    const label = columnSettings[key]?.label || DEFAULT_COLUMN_DEFS.find(d => d.key === key)?.label || key;
    headers.push(label);
  });
  
  customColumns.forEach(c => {
    headers.push(c.name);
  });

  const getProvinceName = (pId: string) => provinces.find(p => p.id === pId)?.name || '—';
  const getZoneName = (pId: string) => {
    const p = provinces.find(p => p.id === pId);
    if (!p) return '—';
    return zones.find(z => z.id === p.zoneId)?.name || '—';
  };

  const tableData = branches.map((b, index) => {
    const row: (string | number)[] = [index + 1];
    
    visibleKeys.forEach(key => {
      switch (key) {
        case 'name': row.push(b.name); break;
        case 'branchId': row.push(b.branchId || '—'); break;
        case 'province': row.push(getProvinceName(b.provinceId)); break;
        case 'zone': row.push(getZoneName(b.provinceId)); break;
        case 'server': row.push(b.server || '—'); break;
        case 'cc': row.push(b.cc || '—'); break;
        case 'ip': row.push(b.ip || '—'); break;
        case 'db': row.push(b.db || '—'); break;
        case 'status': row.push(b.status === 'active' ? 'Activa' : 'Cerrada'); break;
        case 'createdAt': row.push(b.createdAt ? new Date(b.createdAt).toLocaleDateString('es-DO') : '—'); break;
        default:
          row.push((b as any)[key] || '—');
          break;
      }
    });

    customColumns.forEach(c => {
      row.push((b.custom && b.custom[c.id]) || c.defaultValue || '—');
    });

    return row;
  });

  autoTable(doc, {
    head: [headers],
    body: tableData,
    startY: 28,
    styles: { fontSize: 7, cellPadding: 1.5, halign: 'center' },
    headStyles: { fillColor: [26, 35, 126], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { top: 28, left: 10, right: 10, bottom: 15 },
    didDrawPage: (data) => {
      const pageCount = (doc as any).internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`Página ${data.pageNumber} de ${pageCount} - FEX Pharmacy System`, 287, 202, { align: 'right' });
    }
  });

  // NEW: Include province in filename if selected
  const provinceFileName = selectedProvince ? `_${provinceFilter?.replace(/\s+/g, '_')}` : '';
  const fileName = selectedMonth 
    ? `Reporte_Sucursales_FEX_${selectedMonth}${provinceFileName}.pdf`
    : `Reporte_Sucursales_FEX_${new Date().toISOString().slice(0, 10)}${provinceFileName}.pdf`;

  doc.save(fileName);
}

export function generateExcelReport(options: ExportDataOptions) {
  const { branches, zones, provinces, customColumns, columnSettings, columnOrder, selectedMonth, selectedProvince } = options;

  const visibleKeys = columnOrder.filter(key => !columnSettings[key] || columnSettings[key].visible !== false);

  const getProvinceName = (pId: string) => provinces.find(p => p.id === pId)?.name || '—';
  const getZoneName = (pId: string) => {
    const p = provinces.find(p => p.id === pId);
    if (!p) return '—';
    return zones.find(z => z.id === p.zoneId)?.name || '—';
  };

  const headers = ['#'];
  visibleKeys.forEach(key => {
    const label = columnSettings[key]?.label || DEFAULT_COLUMN_DEFS.find(d => d.key === key)?.label || key;
    headers.push(label);
  });
  
  customColumns.forEach(c => {
    headers.push(c.name);
  });

  const rows = branches.map((b, index) => {
    const row: (string | number)[] = [index + 1];

    visibleKeys.forEach(key => {
      switch (key) {
        case 'name': row.push(b.name); break;
        case 'branchId': row.push(b.branchId || ''); break;
        case 'province': row.push(getProvinceName(b.provinceId)); break;
        case 'zone': row.push(getZoneName(b.provinceId)); break;
        case 'server': row.push(b.server || ''); break;
        case 'cc': row.push(b.cc || ''); break;
        case 'ip': row.push(b.ip || ''); break;
        case 'db': row.push(b.db || ''); break;
        case 'status': row.push(b.status === 'active' ? 'Activa' : 'Cerrada'); break;
        case 'createdAt': row.push(b.createdAt ? new Date(b.createdAt).toLocaleDateString('es-DO') : ''); break;
        default:
          row.push((b as any)[key] || '');
          break;
      }
    });

    customColumns.forEach(c => {
      row.push((b.custom && b.custom[c.id]) || c.defaultValue || '');
    });

    return row;
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

  // Set column widths
  const colWidths = headers.map((h, i) => {
    let maxLen = h.length;
    rows.forEach(r => {
      const valStr = String(r[i] || '');
      if (valStr.length > maxLen) maxLen = valStr.length;
    });
    return { wch: Math.min(Math.max(maxLen + 3, 10), 35) };
  });
  ws['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(wb, ws, 'Sucursales FEX');

  // NEW: Include province in filename if selected
  const provinceFilter = selectedProvince ? provinces.find(p => p.id === selectedProvince)?.name : null;
  const provinceFileName = selectedProvince ? `_${provinceFilter?.replace(/\s+/g, '_')}` : '';
  const fileName = selectedMonth 
    ? `Reporte_Sucursales_FEX_${selectedMonth}${provinceFileName}.xlsx`
    : `Reporte_Sucursales_FEX_${new Date().toISOString().slice(0, 10)}${provinceFileName}.xlsx`;

  XLSX.writeFile(wb, fileName);
}
