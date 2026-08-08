---
name: build-refinement-document
description: Genera o actualiza un documento Word (.docx) claro y navegable desde el checkout Markdown verificado de un refinamiento de producto y QA publicado en Notion. Usar únicamente como exportación final opcional cuando una persona quiera compartir, imprimir o archivar historias, criterios, reglas, checks, casos funcionales, escenarios, automatización, pendientes y riesgos.
---

# Build Refinement Document

Crear una vista documental derivada desde el checkout Markdown ligado al último readback verificado de Notion. Notion es la copia oficial compartida; el checkout conserva el snapshot canónico para generar el documento sin alterar decisiones de producto.

## Flujo

1. Identificar la carpeta de artefactos aprobados, comprobar que su snapshot coincide con el último readback verificado de Notion y definir el `.docx` destino.
2. Leer [references/document-contract.md](references/document-contract.md).
3. Ejecutar primero el validador del paquete del orquestador en modo estricto. Detenerse ante relaciones rotas o contenido no aprobado que impida una publicación confiable.
4. Generar el documento con una capacidad DOCX nativa de la IA cuando esté disponible. Aplicar el contrato editorial de esta skill.
5. Si no existe una capacidad DOCX nativa, ejecutar:

   ```bash
   python scripts/build_refinement_document.py <artifact-dir> --output <ruta.docx>
   ```

   El fallback requiere Python 3 y `python-docx`. Informar la dependencia si no está instalada; no instalar software sin autorización.
6. Renderizar el DOCX a imágenes de página con LibreOffice o la herramienta documental disponible. Inspeccionar todas las páginas y corregir cortes, tablas rotas, encabezados huérfanos, tipografía pequeña y bloques amontonados.
7. Confirmar por extracción o inspección que todas las historias aprobadas aparecen. Comparar también conteos de `US`, `AC`, `CHK`, `FTC` y `SC` con el paquete fuente. Para cada `SC-*`, verificar que Word conserva literalmente decisión de automatización, nivel, prioridad, razón, dependencias y estado.
8. Guardar el documento dentro de la carpeta de artefactos como `refinement-document.docx`, salvo que el usuario confirme otro nombre.
9. Actualizar `00-workflow-state.md` y `09-package-index.md` con la ruta, fecha, alcance y estado de generación.

## Reglas de lectura

- Usar una página o sección principal por historia.
- Mantener este orden: `Historia → Criterio → Reglas → Comprobaciones → Escenarios`.
- Mostrar nombres humanos junto a cada identificador; nunca presentar solo siglas.
- Presentar criterios verticalmente. No usar dos columnas para contenido conductual.
- Mostrar dentro del criterio un resumen suficiente de sus escenarios y su estrategia QA completa: decisión, nivel, prioridad, razón, dependencias y estado. Consolidar precondiciones y detalles de ejecución en el caso funcional para controlar repetición.
- Usar tablas únicamente para metadatos cortos y trazabilidad comparable.
- Llevar catálogos extensos, matrices completas y riesgos transversales a anexos.
- Preservar el idioma del paquete.
- No declarar aprobación, ejecución o automatización que los Markdown no registren. Reutilizar la estrategia canónica sin inferirla, resumirla ni recalcularla.

## Resultado requerido

- Un `.docx` autosuficiente y editable.
- Portada breve, guía de lectura e índice navegable cuando la herramienta lo soporte.
- Todas las historias aprobadas del alcance seleccionado.
- Criterios, reglas, comprobaciones y escenarios relacionados sin saltos entre archivos.
- Los seis campos de estrategia QA visibles bajo cada escenario y consistentes con el Markdown canónico.
- Plan funcional, trazabilidad y pendientes reales en secciones separadas.
- Render e inspección visual satisfactorios, o una advertencia explícita si el ambiente no permite renderizar.

No adjuntar los PNG de validación ni convertir el DOCX en fuente canónica.
