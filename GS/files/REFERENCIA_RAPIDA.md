# Referencia Rápida de Código

## 1️⃣ INSTALAR DEPENDENCIA

```bash
npm install html2canvas
```

---

## 2️⃣ COPIAR/PEGAR: Selector de Provincia

### En ReportsView.tsx - Agregar estado (después de línea 18)
```typescript
const [selectedProvince, setSelectedProvince] = useState<string>('all'); // NEW
```

### En ReportsView.tsx - Actualizar useMemo de reportBranches
```typescript
const reportBranches = useMemo(() => {
  let filtered = branches;
  
  if (selectedMonth) {
    const [year, month] = selectedMonth.split('-').map(Number);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    filtered = filtered.filter(b => {
      if (!b.createdAt) return true;
      return new Date(b.createdAt) <= endDate;
    });
  }

  // ADD THIS BLOCK:
  if (selectedProvince !== 'all') {
    filtered = filtered.filter(b => b.provinceId === selectedProvince);
  }

  return filtered;
}, [branches, selectedMonth, selectedProvince]); // Add selectedProvince
```

### En ReportsView.tsx - Agregar dropdown en JSX
```tsx
{/* Después del input de mes, agregar: */}
<div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono">
  <Store className="w-3.5 h-3.5 text-slate-400" />
  <select
    value={selectedProvince}
    onChange={(e) => setSelectedProvince(e.target.value)}
    className="bg-transparent focus:outline-none text-slate-200 font-bold border-none"
  >
    <option value="all">Todas las Provincias</option>
    {provinces.map(p => (
      <option key={p.id} value={p.id}>{p.name}</option>
    ))}
  </select>
</div>
```

### En ReportsView.tsx - Actualizar handleExportPDF y handleExportExcel
```typescript
const handleExportPDF = () => {
  generatePDFReport({
    branches: reportBranches,
    zones,
    provinces,
    customColumns,
    columnSettings,
    columnOrder,
    selectedMonth,
    selectedProvince: selectedProvince !== 'all' ? selectedProvince : undefined // ADD THIS
  });
};

const handleExportExcel = () => {
  generateExcelReport({
    branches: reportBranches,
    zones,
    provinces,
    customColumns,
    columnSettings,
    columnOrder,
    selectedMonth,
    selectedProvince: selectedProvince !== 'all' ? selectedProvince : undefined // ADD THIS
  });
};
```

---

## 2️⃣ COPIAR/PEGAR: Ignorar NA en Validación

### En Dashboard.tsx - Actualizar incompleteBranches
```typescript
const incompleteBranches = useMemo(() => {
  return branches.filter(b => {
    // CAMBIAR ESTA LÓGICA:
    return (
      (b.backups !== 'SI' && b.backups !== 'NA') ||           // Ignorar NA
      (b.externalDisk !== 'SI' && b.externalDisk !== 'NA') || // Ignorar NA
      (b.emailValidation !== 'SI' && b.emailValidation !== 'NA') || // Ignorar NA
      (b.failOver !== 'SI' && b.failOver !== 'NA')            // Ignorar NA
    );
  });
}, [branches]);
```

### En Dashboard.tsx - Actualizar serviceMatrixData
```typescript
const serviceMatrixData = useMemo(() => {
  const labels: Record<string, string> = {
    // ... existing labels
  };

  return SERVICE_KEYS.map(key => {
    const countSI = branches.filter(b => b[key] === 'SI').length;
    const countNA = branches.filter(b => b[key] === 'NA').length;
    const totalApplicable = totalCount - countNA;
    const rate = totalApplicable > 0 ? Math.round((countSI / totalApplicable) * 100) : 0;
    
    return {
      service: labels[key] || key,
      cobertura: rate,
      count: countSI,
      total: totalApplicable // Mostrar este número en lugar de totalCount
    };
  });
}, [branches, totalCount]);
```

### En la tabla de matriz de servicios (actualizar display)
```tsx
{/* Cambiar esta línea: */}
<span className="text-indigo-400 font-mono text-[11px]">
  {item.cobertura}% ({item.count}/{item.total})  {/* Cambiar totalCount a item.total */}
</span>
```

---

## 3️⃣ COPIAR/PEGAR: Exportar PNG

### En Dashboard.tsx - Importar html2canvas
```typescript
import html2canvas from 'html2canvas'; // ADD THIS
```

### En Dashboard.tsx - Crear ref
```typescript
const dashboardRef = useRef<HTMLDivElement>(null); // ADD THIS (después de const { branches... })
```

### En Dashboard.tsx - Agregar función de exportación
```typescript
const handleExportPNG = async () => {
  if (!dashboardRef.current) return;

  try {
    const canvas = await html2canvas(dashboardRef.current, {
      backgroundColor: '#0f172a',
      scale: 2, // 2x para mejor calidad
      useCORS: true,
    });

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `Dashboard_FEX_${new Date().toISOString().slice(0, 10)}.png`;
    link.click();
  } catch (err) {
    console.error('Error exporting dashboard:', err);
    alert('Error al exportar el dashboard como PNG');
  }
};
```

### En Dashboard.tsx - Agregar botón en JSX
```tsx
{/* En el banner de bienvenida, agregar antes del botón "Agregar Sucursal": */}
<button
  onClick={handleExportPNG}
  className="bg-amber-600 hover:bg-amber-500 text-white px-3.5 py-2 rounded-lg font-bold text-xs transition-all shadow-sm shadow-amber-600/20 uppercase tracking-wider active:scale-95 flex items-center gap-1.5"
  title="Exportar dashboard como imagen PNG"
>
  <Image className="w-4 h-4" />
  <span>PNG</span>
</button>
```

### En Dashboard.tsx - Envolver contenido con ref
```tsx
{/* Reemplazar <div className="space-y-5 pb-10"> con: */}
<div ref={dashboardRef} className="space-y-5 pb-10">
  {/* Todo el resto del contenido aquí */}
</div>
```

---

## 📄 COPIAR/PEGAR: exportUtils.ts

### Interfaz mejorada
```typescript
interface ExportDataOptions {
  branches: Branch[];
  zones: Zone[];
  provinces: Province[];
  customColumns: CustomColumn[];
  columnSettings: Record<string, ColumnSetting>;
  columnOrder: string[];
  selectedMonth?: string;
  selectedProvince?: string; // ADD THIS
}
```

### En generatePDFReport - Agregar título con provincia
```typescript
const provinceFilter = selectedProvince 
  ? provinces.find(p => p.id === selectedProvince)?.name 
  : null;
const provinceTitle = provinceFilter ? ` - ${provinceFilter}` : '';

// Usar en el título:
doc.text('FEX Pharmacy - Reporte General de Sucursales' + monthTitle + provinceTitle, 14, 14);
```

### En generatePDFReport - Incluir provincia en nombre de archivo
```typescript
const provinceFileName = selectedProvince 
  ? `_${provinceFilter?.replace(/\s+/g, '_')}` 
  : '';
const fileName = selectedMonth 
  ? `Reporte_Sucursales_FEX_${selectedMonth}${provinceFileName}.pdf`
  : `Reporte_Sucursales_FEX_${new Date().toISOString().slice(0, 10)}${provinceFileName}.pdf`;
```

### En generateExcelReport - Igual que PDF
```typescript
const provinceFilter = selectedProvince 
  ? provinces.find(p => p.id === selectedProvince)?.name 
  : null;
const provinceFileName = selectedProvince 
  ? `_${provinceFilter?.replace(/\s+/g, '_')}` 
  : '';
const fileName = selectedMonth 
  ? `Reporte_Sucursales_FEX_${selectedMonth}${provinceFileName}.xlsx`
  : `Reporte_Sucursales_FEX_${new Date().toISOString().slice(0, 10)}${provinceFileName}.xlsx`;
```

---

## ✅ VERIFICACIÓN

Después de hacer los cambios, verifica:

```javascript
// Abre la consola (F12) y ejecuta estos tests:

// Test 1: Provincia en filtro
console.log('Selector provincia visible:', !!document.querySelector('select'));

// Test 2: Botón PNG presente
console.log('Botón PNG presente:', !!document.querySelector('button:contains("PNG")'));

// Test 3: NA se ignora
const branch = {
  backups: 'NA',
  externalDisk: 'SI',
  emailValidation: 'SI',
  failOver: 'SI'
};
const isIncomplete = (
  (branch.backups !== 'SI' && branch.backups !== 'NA') ||
  (branch.externalDisk !== 'SI' && branch.externalDisk !== 'NA') ||
  (branch.emailValidation !== 'SI' && branch.emailValidation !== 'NA') ||
  (branch.failOver !== 'SI' && branch.failOver !== 'NA')
);
console.log('NA se ignora (debe ser false):', isIncomplete);
```

---

## 🚨 ERRORES COMUNES

### Error: "html2canvas is not defined"
**Solución:** Falta el import
```typescript
import html2canvas from 'html2canvas'; // Agregar al inicio
```

### Error: "Cannot read property 'current' of undefined"
**Solución:** Falta crear el ref
```typescript
const dashboardRef = useRef<HTMLDivElement>(null); // Agregar
```

### Error: "selectedProvince is not defined"
**Solución:** Falta el useState
```typescript
const [selectedProvince, setSelectedProvince] = useState<string>('all'); // Agregar
```

### Error: "Botón PNG no exporta nada"
**Solución:** Verificar que dashboardRef esté asignado a div principal
```tsx
<div ref={dashboardRef} className="..."> {/* Verificar ref aquí */}
```

---

## 📞 AYUDA RÁPIDA

| Problema | Solución |
|----------|----------|
| Provincia no se guarda | Verifica que `selectedProvince` esté en dependencias de useMemo |
| NA sigue contando como incompleto | Verifica que agregaste `&& !== 'NA'` en incompleteBranches |
| PNG no se descarga | Abre consola (F12) y mira errores, verifica permisos de descarga |
| Archivo Excel sin provincia | Verifica que `selectedProvince` se pase a generateExcelReport |
| Dashboard se ve cortado en PNG | Aumenta `scale: 3` en html2canvas |

---

**Última actualización:** Agosto 2026
