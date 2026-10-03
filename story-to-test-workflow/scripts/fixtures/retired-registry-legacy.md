# Historias de usuario — fixture legacy

## Historial de criterios retirados — no implementar

| Criterio | Comportamiento anterior | Decisión vigente |
|---|---|---|
| AC-EXT-01-02 | El admin podía restringir el código a nuevos miembros o renovaciones. | Retirado el 2026-08-21; BR-EXT-04 indica que el código aplica siempre. |
| AC-EXT-02-04 | El código se rechazaba según elegibilidad. | Retirado el 2026-08-21; BR-EXT-04 elimina esa validación. |

## US-EXT-01 — Configurar un código

### Historia

**Como** administrador
**quiero** configurar un código
**para** aplicarlo en compras elegibles.

### AC-EXT-01-01 — Guardar el código

**Condición de aceptación:** el sistema conserva la configuración aprobada.

#### SC-EXT-01-01 — Guardar una configuración válida

**Dado:** un código válido
**Cuando:** el administrador guarda la configuración
**Entonces:** el código queda disponible para uso.
