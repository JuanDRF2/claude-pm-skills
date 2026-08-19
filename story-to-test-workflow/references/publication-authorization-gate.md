# Gate de autorización de publicación

## Propósito

Coordinar una autorización remota completa sin convertir al usuario en operador del flujo.
Este gate aplica a publicaciones localizadas y se ejecuta después de la validación del
paquete, el Judge y la resolución del destino de Notion.

## Flujo autónomo

1. Derivar el cierre de impacto y resolver cada cambio local como seleccionado o excluido;
   leer de Notion únicamente las páginas afectadas por ese cierre, no el proyecto completo.
2. Invocar `publish-refinement-to-notion` para clasificar las presentaciones (`write`,
   `verification-only`, `preserve`, `blocked`) y generar cada payload editorial final.
3. Invocar `sync-refinement-package-notion` para producir los previews técnicos, congelar
   exclusiones y ejecutar `review-session check` sobre todas las unidades y presentaciones
   registradas de cada proyecto. Guardar sus receipts JSON completos.
4. Invocar `refinement-judge` por proyecto con `Action stage: Publication` y el alcance
   técnico/editorial exacto.
5. Validar los reportes con `validate-judge.py --publication` y el expediente con
   `validate-publication-dossier.mjs`; el expediente debe ligar por hash un receipt vigente
   por proyecto y cubrir la suma completa de páginas registradas.
6. Si algo falla, corregirlo localmente y repetir únicamente el validador afectado. No pedir
   instrucciones operativas ni descargar de nuevo todo Notion mientras la sesión sea vigente.
7. Mostrar un solo resumen con páginas, exclusiones, auditorías condicionadas, riesgos y
   `DOSSIER_SHA256`; pedir autorización para ese digest exacto. `verification-only` no cuenta
   como escritura y no requiere autorización explícita, solo aparecer en el resumen.

Detenerse y preguntar solo cuando la corrección exige una decisión de producto, cambia el
alcance remoto o existe un conflicto concurrente. Una estrategia, hash, payload o Judge
faltante es una falla operativa que la IA debe resolver antes de volver al usuario.

Antes de pedir autorización, resolver enlaces internos, simular todo patch y degradarlo a
`replace` si su ancla no es única. No presentar al usuario decisiones técnicas rutinarias.
Mostrar progreso por proyecto y distinguir trabajo local, lectura remota y escritura remota.

## Después de la autorización

Inicializar el estado reanudable por página de `sync-refinement-package-notion` y consultar
metadata fresca una sola vez antes del primer write. Si nada cambió, aplicar exclusivamente
el expediente autorizado. Si una página afectada cambió, releer solo esa página, reconciliarla
y generar un nuevo digest; la autorización anterior deja de ser válida. Un cambio fuera del
alcance autorizado no invalida ni amplía automáticamente la operación — esa página no será
tocada de todas formas.

Una falla parcial no reinicia el lote: conservar páginas verificadas, aislar el proyecto o
página fallida y producir automáticamente un expediente de continuación con lo pendiente.
No pedir nueva autorización si digest, metadata, payloads y alcance continúan idénticos.

Después de escribir, exigir readback completo de cada página escrita, paridad de todas las
presentaciones afectadas, Judge `Post-publication` por proyecto y auditorías idempotentes con
readback y cero duplicados. Un segundo readback solo procede por evidencia ambigua o
normalización documentada, no por rutina. Cerrar el ledger de ejecución con estados por
página, tiempos, lecturas, escrituras, reintentos y presupuestos; enlazarlo por hash en el
receipt final. Reportar el cierre como `localized-verified` salvo que se haya auditado todo
el manifiesto registrado en esa misma sesión. Cerrar solo cuando ese receipt determinista sea
válido.
