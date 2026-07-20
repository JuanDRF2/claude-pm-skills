---
name: publish-refinement-to-notion
description: Publica o actualiza un paquete Markdown aprobado de refinamiento como páginas nativas y fáciles de leer en Notion. Usar cuando una persona quiera revisar colaborativamente historias, criterios, reglas, checks, casos funcionales, escenarios, automatización, pendientes y riesgos en Notion; también cuando el orquestador ofrezca Notion como salida opcional final.
---

# Publish Refinement To Notion

Crear una vista colaborativa derivada. Los Markdown continúan siendo la fuente de verdad; Notion no debe introducir decisiones ni relaciones nuevas.

## Flujo

1. Identificar la carpeta de artefactos aprobados.
2. Leer [references/notion-contract.md](references/notion-contract.md).
3. Ejecutar el validador estricto del orquestador y detenerse ante relaciones rotas que impidan publicar con fidelidad.
4. Confirmar el workspace conectado y el destino:
   - usar la ubicación pedida por el usuario;
   - si no especifica una, crear una página privada independiente;
   - no modificar el PRD original ni otra página existente por conveniencia.
5. Antes de escribir, leer la especificación Markdown o bloques de la integración de Notion disponible.
6. Crear una página principal de proyecto. Para un prototipo o una historia, mantenerla en una sola página. Para varias historias, crear una subpágina por historia y enlazarlas desde la principal.
7. Publicar cada historia como un ticket autosuficiente. Copiar el contenido completo aprobado de la historia, alcance, exclusiones, dependencias, criterios Given/When/Then, definiciones completas de reglas, checks, caso funcional, escenarios, riesgos y readiness. Nunca sustituir contenido por una lista de IDs ni exigir abrir los Markdown para poder revisarlo.
   - Conservar lenguaje claro de producto: actor, acción, resultado y consecuencia antes de nombres técnicos.
   - Si la fuente contiene shorthand técnico o varios recorridos comprimidos, detener la publicación y corregir primero el Markdown canónico; Notion no debe perpetuar una vista difícil de entender.
8. Usar desplegables con esta jerarquía: `Historia → Criterio AC → Escenario SC → comportamiento y cobertura QA`. Mostrar el `FTC` como agrupador de esos mismos `SC`, nunca como fuente de escenarios duplicados.
9. Leer nuevamente las páginas creadas o actualizadas y verificar títulos, relaciones, conteos, bloques y autosuficiencia mediante una muestra representativa y un conteo global.
10. Actualizar `00-workflow-state.md` y `09-package-index.md` con URL, alcance, fecha y estado de publicación.

## Sin conector de Notion

No simular una publicación exitosa. Generar `notion-refinement-export.md` con la misma jerarquía, bloques desplegables cuando el dialecto lo admita y una nota clara de que está pendiente de publicación. El usuario puede pegarlo o usarlo con otra IA que tenga acceso a Notion.

## Seguridad de actualización

- Crear contenido nuevo solo cuando el usuario pida publicarlo.
- Antes de actualizar una página existente, volver a leerla y conservar ediciones ajenas.
- No reemplazar contenido completo si basta una actualización localizada.
- No crear bases de datos, comentarios, tareas ni aprobaciones persistentes salvo solicitud explícita.
- No publicar como sitio público sin confirmación informada.

## Resultado requerido

- Página principal con objetivo, alcance, estado, índice de historias y pendientes transversales.
- Una subpágina por historia cuando haya múltiples historias.
- Cada subpágina contiene toda la información necesaria para revisar y aprobar el futuro ticket Jira sin abandonar Notion.
- Criterios Given/When/Then, reglas, checks, casos y escenarios aparecen con su texto completo; los IDs se conservan solo para trazabilidad.
- Nombres humanos junto a `US`, `AC`, `BR`, `CHK`, `FTC` y `SC`.
- URL verificada y registrada, o exportación local marcada como no publicada.
