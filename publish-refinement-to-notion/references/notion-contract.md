# Contrato de publicación en Notion

## Portada del proyecto

Leer y aplicar completamente [project-cover-template.md](project-cover-template.md). Sus diez secciones, títulos y orden son obligatorios para publicaciones nuevas y republicaciones completas.

La portada debe combinar:

- la lectura editorial de objetivo, alcance y decisiones;
- el control de estado, inventario, `Refinement Judge`, pendientes y readiness;
- la navegación agrupada hacia historias y material de refinamiento.

## Paquete nativo mínimo

En una publicación completa, aplicar `native-package-contract.md`: portada, una página por historia y seis páginas auxiliares obligatorias. En una actualización localizada, preservar las páginas no afectadas y actualizar los resúmenes o enlaces de portada cuya verdad cambie.

No usar `No aplica` porque una página auxiliar todavía no exista en Notion. La aplicabilidad depende del alcance aprobado; la generación depende de la existencia del artefacto Markdown canónico.

No utilizar una lista plana de historias cuando existan más de diez. Agrupar por el story map o release slices canónicos; si no existen, agrupar por outcome o área funcional sin inventar alcance.

Para una sola historia o prototipo, usar una página única.

Cuando exista `11-refinement-judge-report.md`, publicar su veredicto, fecha, snapshot, hallazgos abiertos y autorización del gate en la página principal. No publicar ni actualizar Notion cuando el veredicto sea `FAIL`, salvo una excepción humana explícita registrada para esa acción.

### Uniformidad

- No sustituir los títulos numerados por sinónimos.
- No mover pendientes, riesgos, decisiones o readiness a lugares distintos de la plantilla.
- Una página auxiliar puede contener detalle adicional, pero la portada conserva el resumen y su enlace.
- Una actualización localizada no obliga a reconstruir contenido ajeno; sí debe acercar progresivamente la portada a la plantilla sin borrar decisiones o enlaces vigentes.
- Una publicación nueva o republicación completa debe cumplir la plantilla en su totalidad.

## Página de historia

La página debe ser autosuficiente y revisable como futuro ticket Jira. Un revisor no debe necesitar abrir el paquete Markdown, otra subpágina ni un enlace local para comprender o aprobar la historia. Los enlaces al paquete canónico son trazabilidad adicional, no sustitutos del contenido.

1. Estado y preparación en metadatos cortos.
2. Historia completa en formato Como/Quiero/Para dentro de un callout.
3. Alcance, exclusiones, decisiones, dependencias, supuestos y valor esperado con su texto completo.
4. Criterios desplegables con uno o más escenarios canónicos `SC-*`.
5. Dentro de cada criterio:
   - definición Given/When/Then;
   - reglas aplicables con ID y definición completa, no solo referencias;
   - checks con ID, objetivo, riesgo, nivel, evidencia y estado;
   - escenarios relacionados con pasos/resultados completos y recomendación de automatización.
6. Caso funcional consolidado con precondiciones y datos. El `FTC-*` agrupa por referencia los mismos `SC-*`; no introduce escenarios alternativos ni duplica su comportamiento.
7. Resumen de trazabilidad compacto.
8. Pendientes y riesgos específicos de la historia.

## Regla de contenido completo

- No publicar frases como “consultar el Markdown canónico”, “se conserva en el paquete” o listas de IDs como reemplazo del comportamiento.
- No resumir un criterio, regla, check o escenario si el paquete contiene su definición completa.
- No publicar escenarios con varias acciones distintas comprimidas en un solo `Cuando`, ni resultados no relacionados unidos con punto y coma, flechas, signos `+`, `/` o `=`.
- Preferir lenguaje de producto. Mover nombres de objetos internos, integraciones, eventos, claves y logs a una sección técnica después del resultado observable.
- Conservar explícitamente estado de Producto, Engineering, QA, Design y `Listo para Sprint` cuando existan.
- Marcar historias diferidas o retiradas con su razón, decisiones preservadas y condición de reactivación.
- Publicar las matrices canónicas como páginas o secciones navegables y enlazarlas desde las historias que las consumen. El escenario debe seguir siendo autosuficiente y no puede usar un ID de dataset como sustituto de la configuración y los valores relevantes.
- Si el tamaño obliga a dividir llamadas a Notion, dividir la escritura técnica, no la experiencia final: toda la información debe terminar dentro de la misma subpágina de historia.

## Experiencia

- Abrir por defecto solo la información esencial; usar toggles para detalle.
- No usar columnas para criterios ni comportamiento. Columnas solo para metadatos cortos.
- Evitar tablas largas; usar una tabla únicamente para trazabilidad resumida.
- En el índice visual, representar cada historia en una sola línea mediante `- [US-ID — título](URL_DE_NOTION)`.
- No anidar un bloque `<page>` debajo de un guion vacío. El patrón `-\n  <page ...>` crea un elemento de lista vacío y espacio vertical innecesario.
- Usar enlaces Markdown normales en las secciones 7 y 9.
- Conservar todos los bloques `<page>` únicamente dentro de un desplegable cerrado llamado `Subpáginas internas del proyecto`, después de la sección 10. Este contenedor preserva la jerarquía real sin duplicar la navegación visible.
- Dentro del desplegable, agrupar primero `Historias` y después `Material de refinamiento`. Escribir cada bloque `<page>` directamente, nunca como hijo de una lista.
- No dejar bloques `<page>` sueltos antes o después del desplegable.
- No insertar líneas vacías entre historias consecutivas del mismo grupo. Separar solamente el siguiente encabezado de release, slice, outcome o área.
- No mostrar siglas solas: `Comprobación de cobertura · CHK-PBL-001`.
- Mantener escenarios dentro de la página de la historia; no obligar a navegar a otra página para comprender un criterio.
- Preservar idioma, estados y relaciones explícitas de los Markdown.

## Verificación

Después de publicar, comprobar:

- presencia y orden de las diez secciones canónicas;
- número de historias y criterios;
- número y texto completo de criterios, checks y escenarios relacionados;
- títulos de subpáginas;
- agrupación del índice y separación de activas, diferidas y retiradas;
- ausencia de guiones sin texto, bloques `<page>` anidados en listas, espacios artificiales y enlaces duplicados en el índice;
- existencia de un solo desplegable final `Subpáginas internas del proyecto`, cerrado por defecto, que contenga todos los bloques `<page>` y no repita enlaces editoriales;
- coherencia entre estado de publicación, veredicto del Judge y readiness;
- funcionamiento de desplegables y tablas;
- ausencia de decisiones inventadas;
- privacidad y ubicación correctas.
- ausencia de placeholders o referencias que obliguen a abandonar Notion para revisar el ticket.
- en publicación completa, presencia y enlace de las seis páginas auxiliares, identidad única de sus títulos y paridad con sus fuentes canónicas;
- manifiesto de páginas creadas, actualizadas, preservadas y no generadas.
