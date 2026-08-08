---
name: publish-refinement-to-notion
description: "Publica o actualiza un paquete Markdown aprobado en Notion mediante dos capas coordinadas: la vista colaborativa de refinamiento con portada, historias y materiales, y un espejo técnico 1:1 que conserva rutas, roles, IDs y contenido. Usar para publicación inicial completa o actualización localizada sin perder la experiencia humana ni la sincronización segura."
---

# Publish Refinement To Notion

Crear la vista colaborativa y el espejo nativo 1:1 del paquete definido por
`story-to-test-workflow`. Durante la importación, los Markdown locales son la fuente.
Notion se vuelve la copia compartida oficial solo después del readback completo y el
registro del manifiesto.

## Flujo

1. Identificar la carpeta de artefactos aprobados.
2. Leer completamente:
   - [references/notion-contract.md](references/notion-contract.md);
   - [references/project-cover-template.md](references/project-cover-template.md);
   - [references/native-package-contract.md](references/native-package-contract.md).
   - [references/editorial-update-contract.md](references/editorial-update-contract.md)
     para toda actualización localizada.
3. Ejecutar el validador estricto del orquestador y detenerse ante relaciones rotas que impidan publicar con fidelidad.
4. Clasificar la acción como `Publicación completa` o `Actualización localizada` usando `native-package-contract.md`. Si el usuario pide publicar o republicar el refinamiento sin limitar páginas concretas, usar publicación completa.
5. Confirmar el workspace conectado y el destino:
   - exigir la página padre elegida para este proyecto; no reutilizar la de otro proyecto
     ni crear una página privada independiente por defecto;
   - si falta el destino, continuar localmente y detener la publicación;
   - no modificar el PRD original ni otra página existente por conveniencia.
6. Antes de escribir, leer la especificación Markdown o bloques de la integración de Notion disponible.
7. Dentro de la página padre elegida, descubrir la página colaborativa canónica del
   proyecto por manifiesto y relación padre-hijo; usar el título solo para adopción inicial.
   Adoptarla si existe y no crear copias con sufijos como `(1)`, `copia` o fechas. Conservar
   duplicados ajenos y reportarlos para limpieza en vez de borrarlos sin autorización.
8. Crear o actualizar esa página colaborativa como hija directa del destino elegido:
   portada, una página
   autosuficiente por historia y las seis páginas auxiliares definidas por
   `native-package-contract.md`. Adoptar la vista canónica existente cuando esté
   registrada; no crear otra copia.

En actualización localizada, generar primero la matriz editorial `Actualizar | Resumir |
Preservar | Bloqueada`. No actualizar las seis páginas auxiliares por defecto. Escribir
únicamente cuando cambie información propia de la responsabilidad de esa página; una
relación de trazabilidad por sí sola no justifica duplicar la decisión completa.
9. Crear o adoptar un único contenedor técnico `Subpáginas internas del proyecto` como
   hijo directo de la página colaborativa. Dentro de él, crear o adoptar un único
   `Paquete Markdown`. Para proyectos existentes que ya tengan paquete e historial como
   hijos directos de la página colaborativa, conservar esa jerarquía compatible y no
   moverla solo por formato. Crear dentro del paquete una página nativa por cada Markdown incluido; representar
   `jira/` y `handoffs/` mediante contenedores hijos. No dejar Markdown directamente en la
   página padre general ni como hermanos del proyecto. No consolidar archivos ni
   reconstruirlos desde resúmenes editoriales.
   Crear o adoptar además un único `Historial de sincronización` como hermano de `Paquete
   Markdown` bajo el mismo padre. Mantenerlo fuera del paquete y de
   los snapshots; enlazarlo en la sección 9 y agrupar su bloque `<page>` bajo
   `Operación y auditoría` en el desplegable técnico final.
10. Clasificar cada unidad según `native-package-contract.md`: documentos fuente
   `canonical`; `jira/*.md` y `handoffs/*.md`, `derived`. Publicar ambas clases, pero no
   aceptar ediciones independientes de unidades derivadas como verdad nueva.
11. Publicar cada historia como un ticket autosuficiente. Copiar el contenido completo aprobado de la historia, alcance, exclusiones, dependencias, criterios Given/When/Then, definiciones completas de reglas, checks, caso funcional, escenarios, riesgos y readiness. Nunca sustituir contenido por una lista de IDs ni exigir abrir los Markdown para poder revisarlo.
   - Conservar lenguaje claro de producto: actor, acción, resultado y consecuencia antes de nombres técnicos.
   - Si la fuente contiene shorthand técnico o varios recorridos comprimidos, detener la publicación y corregir primero el Markdown canónico; Notion no debe perpetuar una vista difícil de entender.
   - Si existe una matriz canónica, publicarla como contenido navegable y enlazarla desde las historias consumidoras. Cada escenario debe conservar dentro de su propio `Dado/Cuando/Entonces` la configuración, los valores representativos y el resultado; un ID de dataset nunca sustituye esa explicación.
12. Renderizar cada Markdown con bloques nativos sin alterar su jerarquía de encabezados,
    IDs, texto ni relaciones. Corregir enlaces relativos para apuntar a la página
    correspondiente según el manifiesto.
    - La vista colaborativa completa es `derived` y obligatoria en una publicación
      completa; usar `project-cover-template.md`.
    - La portada debe enlazar el espejo, pero nunca reemplazar archivos, combinar sus
      contenidos ni participar como unidad canónica.
13. Leer nuevamente las páginas creadas o actualizadas y verificar:
   - igualdad entre inventario Markdown incluido y páginas del manifiesto;
   - títulos, rutas, relaciones, conteos, bloques y contenido mediante readback total;
   - agrupación de historias por slice, outcome o área cuando existan más de diez;
   - ausencia de listas planas extensas, decisiones duplicadas y secciones inventadas;
   - ausencia de elementos de lista vacíos, especialmente el patrón `-` seguido por un bloque `<page>`.
   - ausencia de subpáginas repetidas visualmente fuera del desplegable técnico final;
   - ausencia de consolidaciones, omisiones y duplicados;
   - igualdad del snapshot de todas las unidades canónicas y regeneración verificable de
     las derivadas.
   - para cada historia editorial afectada, invocar `sync-refinement-package-notion` para
     ejecutar su verificador de paridad contra `jira/<US-ID>.md` y el readback completo de
     Notion. No resolver rutas internas de otra skill desde el directorio de trabajo. Una
     historia con resumen pero sin criterios, `SC`, `CHK`, `FTC` o comportamiento completo
     falla el gate.
14. Rerun `refinement-judge` en modo de paridad editorial posterior a publicación usando
    los receipts del verificador. No declarar publicación completa ni cerrar auditoría sin
    `PASS` o la excepción humana explícita aplicable.
15. Actualizar `00-workflow-state.md` y `09-package-index.md` con modo, URL, alcance, fecha, estado y manifiesto de páginas creadas, actualizadas, preservadas o no generadas.

## Sin conector de Notion

No simular una publicación exitosa. Generar `notion-refinement-export.md` con la misma jerarquía, bloques desplegables cuando el dialecto lo admita y una nota clara de que está pendiente de publicación. El usuario puede pegarlo o usarlo con otra IA que tenga acceso a Notion.

## Seguridad de actualización

- Crear contenido nuevo solo cuando el usuario pida publicarlo.
- Antes de actualizar una página existente, volver a leerla y conservar ediciones ajenas.
- No reemplazar contenido completo si basta una actualización localizada.
- Las historias, reglas, criterios y casos siguen siendo autosuficientes. La optimización
  no permite sustituir su comportamiento completo por un enlace.
- No interpretar la ausencia previa de una subpágina como `No aplica`; decidirlo por la existencia y aplicabilidad del artefacto Markdown canónico.
- No crear bases de datos, comentarios, tareas ni aprobaciones persistentes salvo solicitud explícita.
- No publicar como sitio público sin confirmación informada.

## Resultado requerido

- Una página colaborativa canónica hija del destino elegido.
- Un único `Paquete Markdown` y un único `Historial de sincronización`, hermanos dentro
  del contenedor técnico registrado. En proyectos heredados, pueden conservarse como hijos
  directos de la página colaborativa.
- Una página nativa por Markdown incluido, con la misma ruta lógica.
- Contenedores para los directorios relativos del paquete.
- Ningún Markdown suelto en el destino general o fuera de `Paquete Markdown`.
- Vista colaborativa completa, incluida la portada, y marcada como derivada.
- Cada subpágina contiene toda la información necesaria para revisar y aprobar el futuro ticket Jira sin abandonar Notion.
- Criterios Given/When/Then, reglas, checks, casos y escenarios aparecen con su texto completo; los IDs se conservan solo para trazabilidad.
- Nombres humanos junto a `US`, `AC`, `BR`, `CHK`, `FTC` y `SC`.
- URL y manifiesto verificados y registrados, o exportación local marcada como no publicada.
- Historial enlazado desde la portada, registrado por ID y vacío de eventos no verificados.
