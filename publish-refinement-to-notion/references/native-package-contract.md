# Contrato del paquete nativo

## Fuente y presentación

La vista derivada de Notion usa `native-pages-fast-v1`:

- cada Markdown canónico o derivado tiene una página nativa 1:1 bajo `Paquete Markdown`;
- portada, historias y materiales son presentaciones humanas derivadas;
- el manifiesto une ruta local, identidad semántica y `notion_page_id`;
- el baseline guarda hashes y contenido remoto para detectar concurrencia.

Se requiere identificar repositorio, rama y commit fuente, pero no un plugin de GitHub,
Notion CLI ni token personal. Un snapshot no mergeado se etiqueta como preview.

## Inventario técnico

Publicar todos los Markdown regulares del contrato del orquestador, incluidos archivos
numerados, `jira/*.md` y `handoffs/*.md`. Excluir `_local`, previews, respaldos, receipts,
archivos temporales y herramientas.

Mantener la estructura de carpetas mediante contenedores nativos. Un mismo Markdown no
puede aparecer dos veces en el manifiesto y una página no puede representar dos archivos.

## Identidad

Registrar como mínimo proyecto, checkout, repositorio y commit fuente; página raíz y página padre; contenedor interno,
`Paquete Markdown` e historial; `id`, rol, ruta y `notion_page_id` de cada unidad; IDs de
presentaciones humanas; encoding y snapshot del manifiesto.

Resolver actualizaciones por ID, no por título. Los títulos ayudan a leer, no son una clave
segura.

## Baseline inicial

Después del primer readback, capturar la versión remota serializada y el hash exacto local
de cada unidad. El baseline queda fuera del paquete, bajo `_local/notion-sync/`.

Las siguientes actualizaciones consultan solo las páginas afectadas. Una auditoría global
se ejecuta únicamente por señal de drift, cambio de serializador/manifiesto, evidencia
faltante o solicitud explícita.

## Presentaciones humanas

Las presentaciones no sustituyen los Markdown técnicos. Deben ser completas para la
revisión y derivarse del mismo snapshot aprobado. Una historia visible incluye sus reglas,
criterios, escenarios, checks, casos funcionales, cobertura y riesgos aplicables.

La portada conserva navegación y contexto. Si tiene páginas hijas, solo admite patches
localizados sobre secciones administradas.

## Migración

Un espejo nativo existente puede adoptarse sin republicar: descubrir jerarquía, resolver
IDs, validar el paquete y capturar un baseline completo una vez. Cualquier mecanismo de
publicación anterior queda fuera del flujo vigente.
