---
name: publish-refinement-to-notion
description: Publica o actualiza un paquete Markdown aprobado de refinamiento como páginas nativas y fáciles de leer en Notion. Usar cuando una persona quiera revisar colaborativamente historias, criterios, reglas, checks, casos funcionales, escenarios, automatización, pendientes y riesgos en Notion; también cuando el orquestador ofrezca Notion como salida opcional final.
---

# Publish Refinement To Notion

> **Nota de mantenimiento:** el autor de esta librería no usa Notion en su propio trabajo y
> no valida este skill contra un workspace de Notion real. No tiene pruebas automatizadas
> propias (es instrucción en prosa, sin scripts) — revísalo a fondo antes de confiar en él
> para un flujo de equipo real.

Crear una vista colaborativa derivada. Los Markdown continúan siendo la fuente de verdad; Notion no debe introducir decisiones ni relaciones nuevas.

## Flujo

1. Identificar la carpeta de artefactos aprobados.
2. Leer completamente:
   - [references/notion-contract.md](references/notion-contract.md);
   - [references/project-cover-template.md](references/project-cover-template.md);
   - [references/native-package-contract.md](references/native-package-contract.md).
3. Ejecutar el validador estricto del orquestador y detenerse ante relaciones rotas que impidan publicar con fidelidad.
4. Clasificar la acción como `Publicación completa` o `Actualización localizada` usando `native-package-contract.md`. Si el usuario pide publicar o republicar el refinamiento sin limitar páginas concretas, usar publicación completa.
5. Confirmar el workspace conectado y el destino:
   - usar la ubicación pedida por el usuario;
   - si no especifica una, crear una página privada independiente;
   - no modificar el PRD original ni otra página existente por conveniencia.
6. Antes de escribir, leer la especificación Markdown o bloques de la integración de Notion disponible.
7. Descubrir las páginas existentes por destino y título canónico antes de crear contenido. Actualizar la página canónica; no crear copias con sufijos como `(1)`, `copia` o fechas. Conservar duplicados ajenos y reportarlos para limpieza en vez de borrarlos sin autorización.
8. Crear la página principal siguiendo exactamente el orden y los títulos definidos en `project-cover-template.md`. No omitir, renombrar ni reordenar secciones; cuando el artefacto canónico realmente no exista, mostrar `No generado` con una explicación verificable.
   - Para un prototipo o una historia, mantenerla en una sola página y conservar la misma portada antes del detalle.
   - Para varias historias, crear una subpágina por historia y enlazarlas desde el índice agrupado de la portada.
9. En una publicación completa, crear o actualizar la portada, una página por historia y las seis páginas auxiliares obligatorias definidas en `native-package-contract.md`. En una actualización localizada, modificar solo las páginas afectadas y los datos de portada cuya verdad cambie; preservar el resto.
10. Publicar cada historia como un ticket autosuficiente. Copiar el contenido completo aprobado de la historia, alcance, exclusiones, dependencias, criterios Given/When/Then, definiciones completas de reglas, checks, caso funcional, escenarios, riesgos y readiness. Nunca sustituir contenido por una lista de IDs ni exigir abrir los Markdown para poder revisarlo.
   - Conservar lenguaje claro de producto: actor, acción, resultado y consecuencia antes de nombres técnicos.
   - Si la fuente contiene shorthand técnico o varios recorridos comprimidos, detener la publicación y corregir primero el Markdown canónico; Notion no debe perpetuar una vista difícil de entender.
   - Si existe una matriz canónica, publicarla como contenido navegable y enlazarla desde las historias consumidoras. Cada escenario debe conservar dentro de su propio `Dado/Cuando/Entonces` la configuración, los valores representativos y el resultado; un ID de dataset nunca sustituye esa explicación.
11. Usar desplegables con esta jerarquía: `Historia → Criterio AC → Escenario SC → comportamiento y cobertura QA`. Mostrar el `FTC` como agrupador de esos mismos `SC`, nunca como fuente de escenarios duplicados.
    - En la portada, mostrar historias y materiales mediante enlaces editoriales en las secciones 7 y 9.
    - Conservar todos los bloques nativos `<page>` dentro de un único desplegable cerrado `Subpáginas internas del proyecto`, ubicado después de la sección 10. No dejar bloques `<page>` sueltos y visibles al final.
12. Leer nuevamente las páginas creadas o actualizadas y verificar:
   - presencia y orden de las diez secciones obligatorias de portada;
   - títulos, relaciones, conteos, bloques y autosuficiencia mediante una muestra representativa y un conteo global;
   - agrupación de historias por slice, outcome o área cuando existan más de diez;
   - ausencia de listas planas extensas, decisiones duplicadas y secciones inventadas;
   - ausencia de elementos de lista vacíos, especialmente el patrón `-` seguido por un bloque `<page>`.
   - ausencia de subpáginas repetidas visualmente fuera del desplegable técnico final;
   - en una publicación completa, presencia, contenido y enlaces de las seis páginas auxiliares, sin títulos duplicados;
   - igualdad del snapshot canónico declarado en portada, historias y páginas auxiliares.
13. Actualizar `00-workflow-state.md` y `09-package-index.md` con modo, URL, alcance, fecha, estado y manifiesto de páginas creadas, actualizadas, preservadas o no generadas.

## Sin conector de Notion

No simular una publicación exitosa. Generar `notion-refinement-export.md` con la misma jerarquía, bloques desplegables cuando el dialecto lo admita y una nota clara de que está pendiente de publicación. El usuario puede pegarlo o usarlo con otra IA que tenga acceso a Notion.

## Seguridad de actualización

- Crear contenido nuevo solo cuando el usuario pida publicarlo.
- Antes de actualizar una página existente, volver a leerla y conservar ediciones ajenas.
- No reemplazar contenido completo si basta una actualización localizada.
- No interpretar la ausencia previa de una subpágina como `No aplica`; decidirlo por la existencia y aplicabilidad del artefacto Markdown canónico.
- No crear bases de datos, comentarios, tareas ni aprobaciones persistentes salvo solicitud explícita.
- No publicar como sitio público sin confirmación informada.
- Publicar o actualizar una página real es una acción de nivel `ask`; ver `skills/ACTION-TIERS.md`.

## Resultado requerido

- Página principal uniforme con las diez secciones de `project-cover-template.md`, en el orden obligatorio.
- Una subpágina por historia cuando haya múltiples historias.
- En una publicación completa, las seis páginas auxiliares obligatorias enlazadas desde la portada.
- Cada subpágina contiene toda la información necesaria para revisar y aprobar el futuro ticket Jira sin abandonar Notion.
- Criterios Given/When/Then, reglas, checks, casos y escenarios aparecen con su texto completo; los IDs se conservan solo para trazabilidad.
- Nombres humanos junto a `US`, `AC`, `BR`, `CHK`, `FTC` y `SC`.
- URL y manifiesto verificados y registrados, o exportación local marcada como no publicada.
