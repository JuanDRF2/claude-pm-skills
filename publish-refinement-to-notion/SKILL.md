---
name: publish-refinement-to-notion
description: Publica opcionalmente en Notion una vista derivada de un refinamiento Markdown aprobado, con páginas nativas legibles y sincronizables. Usar para crear o adoptar portada, espejo Markdown, historias, materiales e historial desde el commit canónico de GitHub o desde un preview de rama explícitamente identificado.
---

# Publish Refinement To Notion

> **Nota de mantenimiento:** el autor de esta librería no usa Notion en su propio trabajo y
> no valida este skill contra un workspace de Notion real. No tiene pruebas automatizadas
> propias (es instrucción en prosa, sin scripts) — revísalo a fondo antes de confiar en él
> para un flujo de equipo real.

Crear una experiencia humana autosuficiente y un espejo nativo 1:1 del paquete Markdown.
GitHub conserva la fuente documental compartida; Notion es una vista derivada y no acepta
decisiones como canon hasta reconciliarlas mediante una rama y Pull Request.
Esta skill prepara la publicación inicial; las actualizaciones posteriores pertenecen a
`sync-refinement-package-notion` bajo `native-pages-fast-v1`.

## Recursos obligatorios

Leer completamente:

- [references/notion-contract.md](references/notion-contract.md);
- [references/project-cover-template.md](references/project-cover-template.md);
- [references/story-page-template.md](references/story-page-template.md);
- [references/native-package-contract.md](references/native-package-contract.md).

Leer [references/editorial-update-contract.md](references/editorial-update-contract.md) si
se adopta o corrige una publicación existente. Invocar `sync-refinement-package-notion`
para manifiesto, baseline, autorización, ejecución y readback.

Para un manifiesto `package_kind: shared-contract`, leer además
[references/shared-contract-cover-template.md](references/shared-contract-cover-template.md)
y usar su portada compacta. No aplicar la portada de diez secciones ni inventar historias,
cobertura o handoffs ausentes del contrato.

## Preflight

1. Resolver la carpeta Markdown, repositorio y commit canónico mergeado. Una rama no
   mergeada solo puede publicarse como preview claramente identificado.
2. Ejecutar validación estricta y Judge. Un `FAIL` solo permite un borrador claramente
   marcado y no autoriza una publicación oficial.
3. Confirmar workspace, página padre y responsable. No modificar el PRD original.
4. Detectar lectura y actualización del conector. No pedir tokens ni Notion CLI.
5. Construir el manifiesto 1:1 y congelar payloads, jerarquía, IDs existentes y estrategia.
6. Validar formato antes de solicitar la autorización remota.

## Jerarquía

Crear o adoptar por identidad padre-hijo una página derivada del proyecto:

```text
Proyecto — Refinamiento Producto + QA
├── historias humanas por US
├── materiales de refinamiento
├── Subpáginas internas del proyecto
│   ├── Paquete Markdown
│   │   ├── 00-workflow-state
│   │   ├── 01-project-understanding
│   │   ├── ...un nodo por cada Markdown...
│   │   ├── jira
│   │   │   └── una página por jira/*.md
│   │   └── handoffs
│   │       └── una página por handoffs/*.md
│   └── Historial de sincronización
```

No consolidar varios Markdown en una sola página y no crear duplicados por título. Cada
página técnica conserva `notion_page_id`, ruta local, rol y hash en el manifiesto.

## Vista colaborativa

Mantener portada de diez secciones, una página autosuficiente por historia, reglas y
decisiones, plan funcional, cobertura, riesgos, handoffs, paquete e historial.

La excepción estructural explícita es `package_kind: shared-contract`: mantener una portada
compacta con autoridad, comportamiento aprobado, decisiones abiertas, consumidores,
gobierno, material técnico y auditoría. Esta excepción no reduce el formato de proyectos.

Agrupar más de diez historias por slice, outcome o área. Cada historia debe mostrar outcome,
alcance, exclusiones, reglas, criterios, escenarios, checks, casos funcionales, riesgos,
readiness y estrategia QA. Seguir `story-page-template.md`; no publicar resúmenes que
obliguen al revisor a navegar para entender el comportamiento.

## Autorización y ejecución inicial

La aprobación o merge en GitHub no autoriza escribir en Notion. Mostrar un solo preview con
página raíz, jerarquía, páginas técnicas/editoriales, preservadas/bloqueadas, estrategia de
portada, validación, Judge, backups, readback y auditoría condicionada. Publicar o
actualizar una página real es una acción de nivel `ask`; ver `skills/ACTION-TIERS.md`.

Tras autorización:

1. comprobar identidades y padres inmediatamente antes de escribir;
2. crear contenedores y registrar los IDs retornados;
3. publicar todas las páginas técnicas del baseline inicial;
4. publicar portada, historias y materiales humanos;
5. usar una canary si serializador, plantilla o transporte no fue probado en ese workspace;
6. hacer un readback completo de cada página creada o adoptada;
7. verificar formato y equivalencia Markdown conservadora;
8. ejecutar Judge `Post-publication`;
9. capturar el baseline `native-pages-fast-v1`;
10. crear una auditoría idempotente solo si todo pasa.

Una portada con subpáginas nunca se reemplaza completa. Un error global de payload detiene
las páginas pendientes. No ampliar el comparador durante la publicación.

## Actualizaciones posteriores

No repetir la publicación inicial ni releer todo el proyecto. Delegar en
`sync-refinement-package-notion`, que calcula el cierre de impacto, consulta solo las
páginas afectadas y actualiza el baseline de las verificadas.

## Resultado

Reportar página raíz, jerarquía, IDs estables, páginas técnicas/editoriales creadas,
adoptadas, preservadas y bloqueadas, baseline, receipts de formato y readback, Judge,
auditoría, commit fuente de GitHub y siguiente paso. No declarar éxito solo por respuestas
HTTP correctas ni describir Notion como la fuente de verdad.
