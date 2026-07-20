---
name: build-refinement-portal
description: Genera o actualiza un portal web interactivo para refinamiento a partir de artefactos Markdown de producto y QA. Usar cuando se necesite convertir historias de usuario, criterios de aceptación, reglas de negocio, checks de cobertura, casos funcionales, escenarios, riesgos y trazabilidad en una experiencia navegable para Producto, DEV y QA; también cuando se pida regenerar, validar o publicar el portal después de cambiar los artefactos.
---

# Build Refinement Portal

Crear una capa de lectura sobre artefactos existentes. No modificar decisiones de producto ni convertir el portal en la fuente de verdad.

## Flujo

1. Identificar la carpeta de artefactos y la carpeta destino del portal.
2. Leer [references/content-contract.md](references/content-contract.md). Leer [references/ux-contract.md](references/ux-contract.md) antes de diseñar o modificar la interfaz.
3. Ejecutar `node scripts/validate-artifacts.mjs <artifact-dir>`.
4. Detener la generación solamente ante errores que impidan relacionar historias, criterios o pruebas. Presentar preguntas breves si faltan decisiones de negocio; no inventarlas.
5. Generar el portal portable con `node scripts/build-static-portal.mjs --output <ruta.html> <artifact-dir> [artifact-dir...]`.
   Tratar el HTML producido por este script como implementación visual canónica. Si se crea una versión alojada, conservar la misma estructura y estilos en lugar de diseñar una segunda interfaz.
6. Generar los datos desde Markdown. No copiar manualmente definiciones que puedan quedar desactualizadas.
7. Construir la experiencia según la jerarquía:
   `Historia → Criterio de aceptación → Reglas → Comprobaciones → Casos funcionales → Escenarios de prueba`.
8. Mantener una vista secundaria **Plan de pruebas** para ejecución y automatización, y otra **Pendientes y riesgos** exclusivamente para decisiones abiertas, dependencias y riesgos reales.
9. Confirmar que el HTML existe, contiene los proyectos esperados y no depende de archivos externos. Volver a ejecutar el validador después de regenerarlo.
10. Entregar el HTML como salida predeterminada. Solo si el usuario pide una aplicación alojada, usar `sites-building` y `sites-hosting`; publicar de forma privada por defecto y requerir confirmación informada antes de una URL pública.

## Reglas de contenido

- Conservar los identificadores para trazabilidad, acompañados siempre por lenguaje humano:
  - `US`: Historia de usuario.
  - `AC`: Criterio de aceptación.
  - `BR`: Regla de negocio.
  - `CHK`: Comprobación de cobertura.
  - `FTC`: Caso funcional.
  - `SC`: Escenario de prueba.
- Tomar la definición completa de cada `CHK` del archivo de cobertura, no del resumen de la historia.
- Mostrar la definición de cada regla dentro del criterio que la utiliza y conservar el catálogo general.
- Relacionar escenarios mediante identificadores explícitos. No inferir relaciones por semejanza textual.
- No clasificar escenarios como positivos, negativos o límite si el artefacto no declara la categoría.
- No presentar trazabilidad como riesgo.
- Mostrar vacíos como advertencias visibles: criterio sin `CHK`, `CHK` sin escenario, referencia inexistente o decisión bloqueada.

## Resultado requerido

- Un único archivo `.html`, responsive, accesible y autosuficiente.
- Búsqueda y selección de proyecto/historia.
- Enlaces profundos por historia y sección.
- Lectura progresiva sin abandonar la página de la historia.
- Datos generados de manera repetible desde los Markdown.
- Generación exitosa y reporte de validación sin errores.
- Apertura local sin servidor, instalación ni conexión a Internet.
- URL privada solo cuando el usuario solicite publicación.

No crear comentarios, aprobaciones persistentes ni sincronización bidireccional con Jira salvo solicitud explícita; esas funciones convierten el portal en un sistema de gestión adicional.

Alojar el portal en una URL pública es una acción de nivel `ask` (privado por defecto, nunca sin confirmación informada); ver `skills/ACTION-TIERS.md`.
