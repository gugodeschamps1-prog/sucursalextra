# Guía de Implementación - FEX Pharmacy Sistema de Gestión de Sucursales

## Resumen de Cambios

Se han implementado 3 cambios importantes al sistema:

1. ✅ **Selector de Provincia en Reportes** - Permite filtrar reportes por provincia específica
2. ✅ **Ignorar servicios NA en validación** - Los servicios marcados como "NA" no cuentan como incompletos
3. ✅ **Exportar Dashboard como PNG** - Nuevo botón para descargar el dashboard como imagen

---

## Cambio 1: Selector de Provincia en Reportes

### ¿Qué cambió?
- Se agregó un dropdown para seleccionar provincia en la vista de reportes
- Los reportes PDF y Excel ahora filtran por provincia seleccionada
- El nombre de la provincia se incluye en el nombre del archivo exportado

### Archivos Modificados
- **`src/components/ReportsView.tsx`** (líneas 15-95)

### Cambios Específicos

#### 1. Nuevo estado para provincia (línea 19)
```typescript
const [selectedProvince, setSelectedProvince] = useState<string>('all');
```

#### 2. Filtro mejorado de branches (líneas 21-43)
```typescript
const reportBranches = useMemo(() => {
  let filtered = branches;
  
  // Apply month filter
  if (selectedMonth) {
    const [year, month] = selectedMonth.split('-').map(Number);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    filtered = filtered.filter(b => {
      if (!b.createdAt) return true;
      return new Date(b.createdAt) <= endDate;
    });
  }

  // Apply province filter (NEW)
  if (selectedProvince !== 'all') {
    filtered = filtered.filter(b => b.provinceId === selectedProvince);
  }

  return filtered;
}, [branches, selectedMonth, selectedProvince]);
```

#### 3. Dropdown de provincia en la UI (líneas 145-155)
```tsx
{/* NEW: Province Selector */}
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

#### 4. Pasar provincia a funciones de exportación (líneas 73-77 y 82-86)
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
    selectedProvince: selectedProvince !== 'all' ? selectedProvince : undefined
  });
};
```

### Cambios en exportUtils.ts

#### 1. Agregar provincia a la interfaz (línea 13)
```typescript
selectedProvince?: string; // NEW: Province ID filter
```

#### 2. Incluir provincia en títulos PDF (líneas 15-22)
```typescript
const provinceFilter = selectedProvince ? provinces.find(p => p.id === selectedProvince)?.name : null;
const provinceTitle = provinceFilter ? ` - ${provinceFilter}` : '';
// Usar provinceTitle en el titulo del documento
```

#### 3. Incluir provincia en nombres de archivos (líneas 63-65)
```typescript
const provinceFileName = selectedProvince ? `_${provinceFilter?.replace(/\s+/g, '_')}` : '';
const fileName = selectedMonth 
  ? `Reporte_Sucursales_FEX_${selectedMonth}${provinceFileName}.pdf`
```

---

## Cambio 2: Ignorar Servicios NA en Validación

### ¿Qué cambió?
- Los servicios marcados como "NA" (No Aplica) ya no se cuentan como incompletos
- "NA" significa que la sucursal no requiere ese servicio específico
- El cálculo de cumplimiento es más preciso por sucursal

### Archivos Modificados
- **`src/components/Dashboard.tsx`** (líneas 42-52)
- **`src/components/Dashboard.tsx`** (líneas 115-136)

### Cambios Específicos

#### 1. Lógica de incompletitud mejorada (líneas 42-52)
```typescript
const incompleteBranches = useMemo(() => {
  return branches.filter(b => {
    // Check if any required service is 'NO', 'Solicitado', or empty (but ignore 'NA')
    return (
      (b.backups !== 'SI' && b.backups !== 'NA') ||
      (b.externalDisk !== 'SI' && b.externalDisk !== 'NA') ||
      (b.emailValidation !== 'SI' && b.emailValidation !== 'NA') ||
      (b.failOver !== 'SI' && b.failOver !== 'NA')
    );
  });
}, [branches]);
```

**Lógica:**
- Una sucursal está **COMPLETA** si:
  - BackUps = 'SI' O 'NA'
  - ExternalDisk = 'SI' O 'NA'
  - EmailValidation = 'SI' O 'NA'
  - FailOver = 'SI' O 'NA'

- Una sucursal está **INCOMPLETA** si cualquier servicio es 'NO' o 'Solicitado' (ignorando 'NA')

#### 2. Cálculo de cobertura por servicio mejorado (líneas 115-136)
```typescript
const serviceMatrixData = useMemo(() => {
  return SERVICE_KEYS.map(key => {
    const countSI = branches.filter(b => b[key] === 'SI').length;
    const countNA = branches.filter(b => b[key] === 'NA').length;
    const totalApplicable = totalCount - countNA; // Exclude branches marked as NA
    const rate = totalApplicable > 0 ? Math.round((countSI / totalApplicable) * 100) : 0;
    return {
      service: labels[key] || key,
      cobertura: rate,
      count: countSI,
      total: totalApplicable // Show applicable count instead of total
    };
  });
}, [branches, totalCount]);
```

**Cambio importante:**
- El denominador ahora es `totalApplicable` (total - NA) en lugar de `totalCount`
- Esto es más justo porque no penaliza sucursales que no requieren un servicio
- El display muestra: `50% (5/10)` en lugar de `50% (5/20)` si 10 sucursales tienen NA

#### 3. Actualización de etiqueta en UI (líneas 449-450 en Dashboard mejorado)
```typescript
<span className="text-indigo-400 font-mono text-[11px]">
  {item.cobertura}% ({item.count}/{item.total})
</span>
```

---

## Cambio 3: Exportar Dashboard como PNG

### ¿Qué cambió?
- Se agregó un nuevo botón "PNG" en el banner del dashboard
- Permite descargar el dashboard como imagen PNG de alta calidad
- La imagen captura todo el contenido visible del dashboard

### Archivos Modificados
- **`src/components/Dashboard.tsx`** (líneas 1-10, 40, 156-169)

### Cambios Específicos

#### 1. Importar dependencia (línea 30)
```typescript
import html2canvas from 'html2canvas';
```

⚠️ **IMPORTANTE:** Necesitas instalar `html2canvas` si no lo está:
```bash
npm install html2canvas
# o
yarn add html2canvas
# o
bun add html2canvas
```

#### 2. Agregar ref al contenedor del dashboard (línea 41)
```typescript
const dashboardRef = useRef<HTMLDivElement>(null);
```

#### 3. Implementar función de exportación PNG (líneas 172-184)
```typescript
const handleExportPNG = async () => {
  if (!dashboardRef.current) return;

  try {
    const canvas = await html2canvas(dashboardRef.current, {
      backgroundColor: '#0f172a',
      scale: 2, // Higher quality
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

#### 4. Agregar botón PNG en la UI (líneas 163-172)
```tsx
<button
  onClick={handleExportPNG}
  className="bg-amber-600 hover:bg-amber-500 text-white px-3.5 py-2 rounded-lg font-bold text-xs transition-all shadow-sm shadow-amber-600/20 uppercase tracking-wider active:scale-95 flex items-center gap-1.5"
  title="Exportar dashboard como imagen PNG"
>
  <Image className="w-4 h-4" />
  <span>PNG</span>
</button>
```

#### 5. Envolver el contenido con ref (línea 139)
```tsx
<div ref={dashboardRef} className="space-y-5 pb-10">
  {/* Todo el contenido del dashboard aquí */}
</div>
```

---

## Instrucciones de Instalación

### Paso 1: Instalar Dependencia (si es necesario)
```bash
npm install html2canvas
```

### Paso 2: Reemplazar Archivos

Reemplaza los siguientes archivos en tu proyecto:

1. **`src/components/ReportsView.tsx`** → Con el archivo `ReportsView.tsx` proporcionado
2. **`src/components/Dashboard.tsx`** → Con el archivo `Dashboard.tsx` proporcionado
3. **`src/lib/exportUtils.ts`** → Con el archivo `exportUtils.ts` proporcionado

### Paso 3: Verificar

- ✅ Verifica que no haya errores de compilación
- ✅ Abre el dashboard y busca el nuevo botón "PNG"
- ✅ En reportes, busca el dropdown de provincias
- ✅ Verifica que servicios NA no se cuenten como incompletos

---

## Casos de Uso

### Caso 1: Reportar solo una provincia
1. Ir a "Reportes"
2. Seleccionar provincia del dropdown
3. Exportar en PDF o Excel
4. Archivo incluirá nombre de provincia: `Reporte_..._Santo_Domingo.pdf`

### Caso 2: Marcar un servicio como NA
1. Editar sucursal
2. Cambiar servicio a "NA" (ejemplo: FailOver no aplica a esta sucursal)
3. El dashboard actualiza automáticamente
4. La sucursal no se marca como incompleta por ese servicio
5. La cobertura se calcula solo con sucursales aplicables

### Caso 3: Exportar dashboard como PNG
1. Revisar el dashboard
2. Clic en botón "PNG" (amarillo)
3. Se descarga automáticamente como PNG de alta resolución
4. Puedes compartir como imagen en reportes o presentaciones

---

## Preguntas Frecuentes

### ¿Qué pasa si selecciono "Todas las Provincias"?
Se mostrarán datos de todas las provincias (comportamiento original).

### ¿Los servicios NA afectan el porcentaje de cumplimiento general?
No, el porcentaje de cumplimiento solo cuenta sucursales aplicables (sin NA).

### ¿Puedo cambiar la calidad del PNG exportado?
Sí, modifica la línea `scale: 2` en `handleExportPNG`:
- `scale: 1` = calidad normal
- `scale: 2` = alta calidad (lento)
- `scale: 3` = muy alta calidad (más lento)

### ¿Los nombres de archivos incluyen la provincia?
Sí, automáticamente incluyen el nombre de la provincia si fue filtrada.

### ¿Qué navegadores soportan la exportación PNG?
Todos los navegadores modernos (Chrome, Firefox, Safari, Edge).

---

## Notas Técnicas

### Dependencias Nuevas
- `html2canvas` - Versión recomendada: >=1.4.1

### Cambios en la Interfaz
- Nueva opción "NA" ya está soportada en el tipo `ServiceValue`
- No hay cambios necesarios en la base de datos

### Performance
- La exportación PNG toma 2-3 segundos (depende del tamaño)
- No afecta la performance del dashboard durante su uso normal

---

## Soporte

Si encuentras algún problema:

1. Verifica que `html2canvas` esté instalado: `npm list html2canvas`
2. Limpia cache: `npm cache clean --force`
3. Reinstala dependencias: `rm -rf node_modules && npm install`
4. Reconstruye el proyecto: `npm run build`

---

**Última actualización:** Agosto 2026
**Versión:** 1.0
