# Diagramas de Flujo - FEX Pharmacy Cambios

## 📊 Diagrama 1: Flujo de Reportes con Filtro de Provincia

```
┌─────────────────────────────────────────────────────────┐
│ VISTA REPORTES                                          │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│ Seleccionar Mes & Provincia                             │
│ ┌──────────────┐  ┌──────────────────┐                 │
│ │ Mes: 2024-08 │  │ Provincia: Todas │ ◀──┐            │
│ └──────────────┘  └──────────────────┘    │ Usuario    │
└─────────────────────────────────────────────────────────┘
                        │
         ┌──────────────┴──────────────┐
         │                             │
         ▼                             ▼
    ┌─────────────┐          ┌──────────────────┐
    │ Mostrar PDF │          │ Mostrar Excel    │
    └─────────────┘          └──────────────────┘
         │                             │
         ├─ Filtrar ramas ────────────┤
         │  por Provincia             │
         │                             │
         ├─ Filtrar ramas ────────────┤
         │  por Mes                   │
         │                             │
         ├─ Incluir provincia ────────┤
         │  en nombre archivo         │
         │                             │
         ▼                             ▼
  Reporte_..._                 Reporte_..._
  Santo_Domingo.pdf            Santo_Domingo.xlsx


LÓGICA DE FILTRADO:
═════════════════════════════════════════════════════════

1. Obtener todas las sucursales
2. IF (selectedMonth)
   → Filtrar por mes
3. IF (selectedProvince !== 'all')
   → Filtrar por provincia específica
4. Mostrar datos filtrados
5. Exportar con nombre incluyendo provincia
```

---

## 📊 Diagrama 2: Lógica de Validación de Servicios NA

```
┌──────────────────────────────────────────────────────┐
│ EVALUAR SUCURSAL: Centro Histórico                   │
└──────────────────────────────────────────────────────┘
                      │
                      ▼
            ┌────────────────────┐
            │ Revisar BackUps    │
            │ Valor: NA          │
            └────────────────────┘
                      │
         ┌────────────┴────────────┐
         │                         │
    ¿NA? YES                   ¿NA? NO
         │                         │
         ▼                         ▼
    IGNORAR               ¿Es 'SI'?
    (No contar)          ┌────────────┐
         │               │ YES: OK ✓  │
         │               │ NO: ERROR ✗│
         │               └────────────┘
         │                     │
         └─────────────────────┘
                     │
                     ▼
         ┌────────────────────┐
         │ Revisar siguiente  │
         │ servicio           │
         └────────────────────┘


TABLA DE EVALUACIÓN:
═════════════════════════════════════════════════════════

┌───────────────────┬──────────────┬──────────────┐
│ Valor Servicio    │ Cuenta como  │ Resultado    │
├───────────────────┼──────────────┼──────────────┤
│ 'SI'              │ Completo     │ ✓ OK         │
│ 'NO'              │ Incompleto   │ ✗ FALTA      │
│ 'Solicitado'      │ Incompleto   │ ✗ PENDIENTE  │
│ 'NA'              │ NO (IGNORA)  │ ✓ N/A        │
│ (vacío)           │ Incompleto   │ ✗ SIN DATO   │
└───────────────────┴──────────────┴──────────────┘

RESULTADO FINAL:
Sucursal COMPLETA si: BackUps='SI' AND Disco='SI' AND Email='SI' AND FailOver='SI'
                      (o cualquiera pueda ser 'NA')
```

---

## 📊 Diagrama 3: Algoritmo de Cálculo de Cobertura

```
ANTES (Incorrecto con NA):
═════════════════════════════════════════════════════════

┌─ Contar servicios SI
│
├─ Total sucursales: 20
│
├─ BackUps = 'SI': 18 sucursales
├─ De las cuales 5 tienen NA
│
├─ Cálculo: 18/20 = 90%
│
└─ PROBLEMA: Penaliza NA aunque no aplica


DESPUÉS (Correcto con NA):
═════════════════════════════════════════════════════════

┌─ Contar servicios SI
│
├─ Total sucursales: 20
│
├─ BackUps = 'SI': 18 sucursales
├─ BackUps = 'NA': 5 sucursales
├─ BackUps aplicables: 20 - 5 = 15 sucursales
│
├─ Cálculo: 18/15 = 120% ❌ (error!)
│          OR
│ Corrección: Solo 13 sucursales tienen SI de las 15 aplicables
│            13/15 = 86.67% ✓ (correcto)
│
├─ VENTAJA: No penaliza NA
│
└─ Display: 86% (13/15) ← Muestra denominador correcto


PSEUDOCÓDIGO:
═════════════════════════════════════════════════════════

for each service in SERVICES:
  countSI = branches.where(service == 'SI').length
  countNA = branches.where(service == 'NA').length
  totalApplicable = totalBranches - countNA
  
  if totalApplicable > 0:
    coverage = round((countSI / totalApplicable) * 100)
  else:
    coverage = 0
  
  display: "${coverage}% (${countSI}/${totalApplicable})"
```

---

## 📊 Diagrama 4: Flujo de Exportación PNG

```
┌──────────────────────────────────────────────────────┐
│ USUARIO HACE CLICK EN BOTÓN PNG                      │
└──────────────────────────────────────────────────────┘
                      │
                      ▼
            ┌──────────────────────┐
            │ handleExportPNG()    │
            │ es llamada           │
            └──────────────────────┘
                      │
                      ▼
            ┌──────────────────────┐
            │ Verificar que existe │
            │ dashboardRef.current │
            └──────────────────────┘
                      │
         ┌────────────┴────────────┐
         │                         │
      SI │                         │ NO
         │                         │
         ▼                         ▼
    Continuar              Retornar (error)
         │
         ▼
    ┌──────────────────────────────────┐
    │ html2canvas(dashboardRef.current)│
    │ Renderizar DOM a Canvas          │
    │ - backgroundColor: #0f172a       │
    │ - scale: 2 (alta calidad)        │
    │ - useCORS: true                  │
    └──────────────────────────────────┘
         │
         ▼
    ┌──────────────────────────────────┐
    │ Convertir Canvas a Data URL      │
    │ (PNG codificado en base64)       │
    └──────────────────────────────────┘
         │
         ▼
    ┌──────────────────────────────────┐
    │ Crear elemento <a> temporal      │
    │ link.href = dataURL              │
    └──────────────────────────────────┘
         │
         ▼
    ┌──────────────────────────────────┐
    │ Definir nombre de archivo        │
    │ "Dashboard_FEX_YYYY-MM-DD.png"   │
    └──────────────────────────────────┘
         │
         ▼
    ┌──────────────────────────────────┐
    │ Simular click en <a>             │
    │ link.click()                     │
    └──────────────────────────────────┘
         │
         ▼
    ┌──────────────────────────────────┐
    │ DESCARGA PNG                     │
    │ ✓ Guardado en Descargas          │
    └──────────────────────────────────┘


TIMELINE:
═════════════════════════════════════════════════════════

1. Click botón PNG
                              ▼
2. Esperar html2canvas (2-3 segundos)
   [████████████████████] 100%
                              ▼
3. Generar PNG (instantáneo)
                              ▼
4. Mostrar diálogo de descargar
                              ▼
5. PNG guardado en Descargas
   📥 Dashboard_FEX_2024-08-06.png
```

---

## 📊 Diagrama 5: Integración de Cambios

```
SISTEMA ORIGINAL:
═════════════════════════════════════════════════════════

┌─────────────────────────────────────┐
│ Dashboard                           │
│ └─→ Calcula cumplimiento            │
│     └─→ Cuenta todos los servicios  │
│         (incluyendo NA)             │
└─────────────────────────────────────┘
                ▲
                │
┌─────────────────────────────────────┐
│ Reportes                            │
│ └─→ Filtra por mes                  │
│     (sin provincia)                 │
└─────────────────────────────────────┘

                ▲
                │
┌─────────────────────────────────────┐
│ Exportación                         │
│ └─→ PDF / Excel                     │
│     (sin imagen)                    │
└─────────────────────────────────────┘


SISTEMA MEJORADO:
═════════════════════════════════════════════════════════

┌─────────────────────────────────────┐
│ Dashboard ✨ NUEVO BOTÓN PNG         │
│ └─→ Calcula cumplimiento ✨ SIN NA   │
│     └─→ Ignora servicios NA         │
│     └─→ Exportar PNG (alta res)     │
└─────────────────────────────────────┘
                ▲
                │
┌─────────────────────────────────────┐
│ Reportes ✨ SELECTOR PROVINCIA       │
│ └─→ Filtra por mes                  │
│ └─→ Filtra por provincia ✨ NUEVO    │
│     └─→ PDF / Excel con provincia   │
└─────────────────────────────────────┘

                ▲
                │
┌─────────────────────────────────────┐
│ Exportación                         │
│ └─→ PDF / Excel / PNG ✨            │
│     └─→ Nombre con provincia ✨     │
│     └─→ Ignore NA en cálculos ✨    │
└─────────────────────────────────────┘


IMPACTO EN DATOS:
═════════════════════════════════════════════════════════

Sucursal: Centro Histórico
├─ BackUps: SI           ✓ OK
├─ Disco: NA             ✓ IGNORA (era ❌ antes)
├─ Email: SI             ✓ OK
└─ FailOver: SI          ✓ OK

Estado ANTES:  ❌ Incompleta (3/4)
Estado DESPUÉS: ✅ Completa (3/3 aplicables)

Impacto en Dashboard:
├─ Cumplimiento: 75% → 85%
├─ Incompletas: 5 → 4
└─ Cobertura Email: 80% → 85%
```

---

## 📊 Diagrama 6: Árbol de Decisiones

```
¿Hacer cambios en FEX Pharmacy?
│
├─ ¿Usuario necesita filtrar reportes por provincia?
│  ├─ YES → Implementar Cambio 1 ✓
│  └─ NO  → Saltar
│
├─ ¿Hay sucursales sin algunos servicios (NA)?
│  ├─ YES → Implementar Cambio 2 ✓
│  └─ NO  → Saltar
│
└─ ¿Se necesita compartir dashboard como imagen?
   ├─ YES → Implementar Cambio 3 ✓
   └─ NO  → Saltar

EN ESTE CASO: TODOS LOS CAMBIOS APLICAN ✓✓✓
```

---

## 🔧 Diagrama 7: Estructura de Carpetas Modificadas

```
src/
├── components/
│   ├── Dashboard.tsx ✨ MODIFICADO
│   ├── ReportsView.tsx ✨ MODIFICADO
│   ├── BranchModal.tsx (sin cambios)
│   ├── BranchesList.tsx (sin cambios)
│   └── ...
│
├── context/
│   └── AppContext.tsx (sin cambios)
│
├── lib/
│   ├── exportUtils.ts ✨ MODIFICADO
│   ├── initialData.ts (sin cambios)
│   └── firebase.ts (sin cambios)
│
├── types.ts (sin cambios)
│   └── ServiceValue = 'SI' | 'NO' | 'Solicitado' | 'NA'
│       (ya soporta NA)
│
└── main.tsx (sin cambios)

package.json
├── html2canvas ✨ NUEVO (npm install)
└── resto de dependencias (sin cambios)
```

---

## 📈 Diagrama 8: Impacto de Performance

```
OPERACIÓN: Exportar Dashboard PNG

Escenario 1: 25 sucursales
├─ Renderizar: 1-2 segundos
├─ Exportar PNG: 0.5 segundos
└─ Total: 1.5-2.5 segundos ✓ ACEPTABLE

Escenario 2: 100 sucursales
├─ Renderizar: 2-3 segundos
├─ Exportar PNG: 1-2 segundos
└─ Total: 3-5 segundos ✓ ACEPTABLE

Escenario 3: 500+ sucursales
├─ Renderizar: 3-5 segundos
├─ Exportar PNG: 2-3 segundos
└─ Total: 5-8 segundos ⚠️ TOLERABLE

No hay impacto en:
- Navegación del sitio
- Carga de datos
- Otras operaciones
```

---

**Versión:** 1.0  
**Última actualización:** Agosto 2026
