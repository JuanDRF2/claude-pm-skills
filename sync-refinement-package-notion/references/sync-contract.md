# Contrato de sincronización nativa

## Autoridad

El Markdown mergeado en la rama canónica de GitHub es el canon documental compartido.
Notion es una vista colaborativa derivada. El manifiesto y baseline vinculan el commit
fuente con las páginas por identidad estable.

La autenticación pertenece a la IA o persona que ejecuta el flujo. No pedir, almacenar ni
compartir tokens. El conector realiza transporte; los scripts locales calculan impacto,
conflictos, estrategias y evidencia.

## Serialización

Guardar el Markdown interior de la página, sin envoltorios ni metadata del conector. Usar
UTF-8, LF y un salto final. Conservar contenido y estructura significativa. Una respuesta
truncada o incompleta no sirve como readback.

Cada entrada mantiene:

- repositorio, rama y commit GitHub fuente del snapshot;
- `source_sha256`: Markdown local exacto;
- `remote_sha256`: readback remoto exacto;
- contenido remoto base para comparación de tres vías;
- `notion_page_id`, ruta y rol.

## Estado local

Guardar evidencia bajo `artifacts/_local/notion-sync/<project>/`: baseline, backups,
conflictos, dossiers, readbacks y receipts. El checkout editable vive en
`artifacts/<slug>/` o `artifacts/_shared/<slug>/`, nunca en `_local/`.

## Start y baseline

Sin baseline confiable:

1. leer el manifiesto;
2. descargar y serializar todas las páginas registradas;
3. comparar la captura con el checkout obtenido de GitHub; no reemplazarlo automáticamente;
4. bloquear truncación, identidades faltantes y diferencias no reconciliadas; una edición
   material remota se convierte en propuesta para una rama/PR;
5. capturar el baseline completo con `fast-sync.mjs capture`.

Esta lectura completa no se repite en cada publicación.

## Estado y plan

`status` compara localmente checkout y baseline. `plan` aplica el grafo de impacto y exige
que toda diferencia local esté seleccionada o excluida con razón. Las diferencias
históricas quedan fuera del write set.

Validar el paquete completo antes de publicar. La optimización reduce I/O remoto, no la
trazabilidad ni los controles locales.

## Preflight y publicación

1. Leer solo páginas técnicas/editoriales seleccionadas.
2. Comparar base, target local y remoto.
3. Suprimir no-op como `verification-only`.
4. Bloquear conflicto solo en la página y dependientes afectados.
5. Congelar payloads, estrategias, hashes, backups y auditoría condicionada.
6. Ejecutar Judge y pedir autorización del digest exacto.
7. Antes de cada write, confirmar de nuevo solo esa página.
8. Respaldar, escribir y releer completamente.
9. Verificar exacto o `markdown-semantic` con comparador versionado.
10. Actualizar baseline únicamente para páginas verificadas.
11. Ejecutar Judge posterior y crear auditoría idempotente.

Una página verificada no vuelve a una continuación. Una falla se recupera con su backup y
no invalida páginas independientes ya verificadas.

## Reconciliación

Cuando remoto y GitHub cambiaron respecto a la base, preservar ambos y clasificar el
conflicto. Combinar requiere decisión humana, una rama/PR y validación de reglas, IDs y
trazabilidad; la ausencia de colisión textual no demuestra compatibilidad. Notion nunca se
promueve directamente sobre la rama canónica.

## Alcance de evidencia

- `localized-verified`: se verificó todo el cambio declarado, no todo el proyecto remoto.
- `globally-audited`: se releyó el manifiesto completo en esta ejecución.

No usar lenguaje de alineación global para una operación localizada. Ejecutar `full-audit`
solo por solicitud, baseline inicial, cambio incompatible de manifiesto/serializador,
evidencia ausente o señal real de drift global.

## Presentaciones

Portada, historias y materiales se registran en `manifest.presentations`. Una decisión nueva
se incorpora primero al Markdown mediante rama, revisión y merge. Una mejora editorial
compatible puede preservarse; una edición accidental se recupera desde su baseline.

Nunca hacer `replace` sobre una portada con subpáginas o bloques no administrados. Resolver
enlaces relativos a `notion_page_id` antes de congelar payloads.

## Historial

Crear una subpágina append-only únicamente después de una publicación o recuperación
verificada. El evento incluye alcance localizado/global, páginas escritas y no-op, hashes,
Judge y receipt. No auditar previews o intentos fallidos como publicación completa.
