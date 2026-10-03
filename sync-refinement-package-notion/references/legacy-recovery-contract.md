# Contrato de recuperación legacy

Usar solo para reanudar una publicación antigua incompleta que ya tenga ledger, dossier o
checkpoint congelado. No usar este costo operativo para proyectos nuevos ni actualizaciones
normales bajo `native-pages-fast-v1`.

## Límite de compatibilidad

- No crear nuevas sesiones de revisión, planes de alcance, auditorías completas del
  manifiesto ni expedientes legacy para trabajo normal.
- Usar `review-session.mjs`, los planes legacy de escritura o presentación de
  `refinement-sync.mjs` y receipts `review-session-check` únicamente cuando una evidencia
  congelada de una ejecución antigua los exija de forma explícita.
- Toda publicación nueva o actualización normal usa `native-pages-fast-v1`, freshness de
  páginas afectadas y el contrato vigente enlazado desde `SKILL.md`.
- Si no existe evidencia legacy congelada, no reconstruirla: iniciar o adoptar el baseline
  vigente.

## Principios

1. Reutilizar capturas, raw responses, backups y readbacks válidos. Consultar metadata para
   vigencia; releer contenido únicamente cuando cambió, falta o es ambiguo.
2. Mantener grupos disjuntos y exhaustivos: `verified`, `ready-for-remote-recovery`,
   `preserved` y `failed-unchanged`. Una portada pendiente se registra separadamente.
3. No modificar el serializador o comparador usado por una ejecución activa. Preparar una
   versión candidata, probarla con raw retenido y adoptarla mediante un checkpoint nuevo.
4. Los checkpoints anteriores son inmutables. Actualizar el puntero vigente de forma
   atómica y exacta según `evidence-integrity-contract.md`.
5. Resolver primero fuentes canónicas y después todos sus consumidores: Jira, payload
   técnico y presentación editorial.

## No-op y alcance mínimo

Si el hash remoto vigente coincide con el payload objetivo, clasificar la página como
`verification-only`: un readback, cero backup de escritura, cero replace y cero rollback.
Las páginas verificadas o preservadas quedan fuera de escrituras y de descargas completas.
En una continuación localizada, consultar metadata solo del alcance necesario para probar
vigencia según el receipt ya capturado.

La búsqueda por UUID puede no devolver una página existente. Usar el `notion_page_id`
registrado para lectura directa; un backup completo que confirma ID, título y padre es la
evidencia autoritativa de identidad. No inventar ausencia a partir de una búsqueda vacía.

## Readback

Realizar un readback completo por página afectada. Hacer un segundo solo cuando el primero
sea incompleto, ambiguo, transitorio o cuando una canary esté probando estabilidad. El
segundo readback no convierte automáticamente una diferencia en equivalencia.

Primero exigir SHA exacto. Si Notion cambió únicamente representación, aceptar equivalencia
semántica solo mediante una política localizada con casos negativos. Puede cubrir, cuando
la evidencia lo demuestre:

- líneas vacías fuera de fences sin alterar límites de bloques;
- espaciado del separador de tabla conservando celdas, filas, columnas y orden;
- hosts de URL de Notion distintos con el mismo page ID, etiqueta y posición;
- separadores vacíos entre un párrafo y una lista conservando párrafo, cantidad, texto,
  orden, nivel y ausencia de anidación.

Bloquear siempre cambios en Gherkin, texto funcional, headings, IDs, celdas, estructura de
listas, destinos externos o page IDs. No ampliar el comparador global para una anomalía
local.

## Canary

Cuando una transformación de Notion aún no está demostrada, usar una página temporal en un
contenedor autorizado: payload y hash congelados, alcance de una página, dos readbacks sin
escrituras intermedias y limpieza recuperable. No tocar la página productiva hasta aprobar
la prueba. Registrar creación, readbacks y limpieza.

## Portadas con subpáginas

Nunca usar reemplazo completo. Congelar anchors únicos, simular el patch local, usar
`update_content` localizado y verificar que IDs, títulos y orden de las subpáginas se
conservaron físicamente.

## Autonomía y autorizaciones

Resolver diagnóstico, cache, reserialización y validación local sin pedir decisiones
rutinarias. Pedir intervención solo por decisión de contenido, drift remoto o escritura
externa. Cuando el expediente exacto ya existe, solicitar directamente su ejecución.
Después de una escritura, rollback o drift, el digest autorizado se considera consumido.
