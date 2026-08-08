---
name: sync-refinement-package-notion
description: Sincroniza de forma segura paquetes Markdown de refinamiento con páginas nativas de Notion usando la conexión disponible de cada IA; mantiene snapshots, manifiestos de identidad, comparación de tres vías, validación, readback y recuperación. Usar para iniciar o actualizar una copia local, comprobar estado, publicar cambios aprobados, reconciliar conflictos o migrar un proyecto a un flujo Notion-first.
---

# Sync Refinement Package Notion

Mantener Notion como fuente compartida y Markdown como copia local de trabajo. Usar la
conexión de Notion autenticada en la IA activa como transporte y el CLI neutral
`refinement-sync` como motor de snapshots y conflictos. No exigir que todas las personas o
IAs compartan un token.

Leer [references/sync-contract.md](references/sync-contract.md) antes de `start`, `publish`,
`reconcile` o `recover`. Leer [references/page-manifest-contract.md](references/page-manifest-contract.md)
al registrar o migrar un proyecto.

## Seleccionar una operación

- `discover`: derivar un manifiesto candidato y evidencia desde un árbol leído por el
  conector, sin escribir en Notion ni en el registro.
- `status`: comparar Notion, snapshot base y local sin escribir.
- `start`: crear o actualizar una copia local segura desde Notion.
- `publish`: validar y publicar cambios locales aprobados.
- `reconcile`: clasificar cambios concurrentes o contradicciones para decisión humana.
- `recover`: restaurar una publicación parcial desde el respaldo previo.
- `register`: validar y registrar localmente el manifiesto página↔artefacto de un proyecto
  existente, sin escribir en Notion.
- `baseline`: aceptar una presentación revisada como nueva base sin escribir en Notion.

Inferir la operación. Preguntar solo cuando dos opciones impliquen escrituras distintas.

## Límites

- Usar `publish-refinement-to-notion` para crear la presentación nativa inicial o cambiar su
  arquitectura editorial.
- Usar esta skill para sincronización posterior, concurrencia, readback y recuperación.
- Usar `story-to-test-workflow` para decisiones de producto, gates, validación y Judge.
- No tratar comentarios como contenido canónico hasta que una decisión se incorpore a la página.

## Precondiciones

1. Resolver el proyecto por su manifiesto registrado; no buscar por título para publicar.
   Validar que `notion_root_page_id` sea hijo de `notion_parent_page_id`. Si el manifiesto
   declara `notion_internal_container_page_id`, validar root → contenedor → paquete e
   historial; de lo contrario, validar root → paquete e historial. Paquete e historial
   siempre deben ser hermanos y el historial no puede pertenecer a `units` ni
   `presentations`.
2. Validar primero la conexión disponible consultando la identidad del workspace y las
   capacidades actuales. Registrar solo proveedor, workspace y actor; nunca credenciales.
3. Exigir un conector autenticado de la IA activa. Si no existe, detenerse y pedir al
   usuario que conecte Notion mediante esa IA; no solicitar ni administrar tokens.
4. Exigir lectura para `status` y `start`; exigir actualización solo para `publish` o
   `recover`.
5. Detenerse si una respuesta Markdown está truncada, contiene bloques desconocidos no
   recuperados o carece de permisos.
6. Guardar estado operativo en `artifacts/_local/notion-sync/`, nunca dentro del paquete.

## Ejecución

Usar `refinement-sync` disponible en `PATH`; si no está en `PATH`, ejecutar
`scripts/refinement-sync.mjs` desde esta skill. Con un conector de IA, leer cada
`notion_page_id` del manifiesto, guardar el Markdown remoto en un directorio temporal
operativo por `unit.id` y pasarlo al motor con `--remote-dir`. El directorio no es una
segunda fuente de verdad y puede descartarse después del snapshot.
Serializar cada lectura como `notion-inner-markdown-lf-v1` según `sync-contract.md`: solo
el interior de `<content>`, UTF-8, LF y exactamente un salto final.

Cuando el conector devuelva el envoltorio completo `<page>` y tablas HTML, pasar cada
respuesta por `scripts/serialize-notion-fetch.mjs --out <ruta-remota>`. El serializador
extrae un `<content>` completo, convierte tablas y continuaciones a Markdown estable y
restaura la separación de bloques; se detiene ante respuestas truncadas. No copiar la
respuesta cruda ni implementar esta normalización de forma ad hoc en cada IA.

Para registrar un proyecto existente, construir el manifiesto según
`page-manifest-contract.md` y guardar por separado evidencia fresca de la jerarquía leída
por el conector. La evidencia debe declarar los IDs de root, parent, paquete e historial,
el contenedor interno cuando aplique y sus relaciones padre-hijo. Ejecutar:

Para evitar construcción manual, serializar primero el árbol leído por el conector como
`{root_id,parent_id,read_at,pages:[{id,title,parent_id}]}` y ejecutar:

```bash
refinement-sync discover <project> --tree <arbol.json>
refinement-sync discover <project> --tree <arbol.json> --apply --out <directorio>
```

El preview devuelve el candidato sin escribir archivos. `--apply` escribe únicamente
`candidate-manifest.json` y `hierarchy-evidence.json`; no escribe en Notion ni en
`projects.json`. Revisar `unclassified_pages`, resolver contratos compartidos por separado
y no registrar mientras `classification_complete` sea falso.

```bash
refinement-sync register <project> --preview \
  --manifest <manifiesto-candidato.json> \
  --hierarchy-evidence <jerarquia-leida.json>
refinement-sync register <project> --apply \
  --manifest <mismo-manifiesto.json> \
  --hierarchy-evidence <misma-jerarquia.json>
```

`register` solo actualiza `projects.json`; no crea páginas ni escribe en Notion. Detenerse
si el proyecto ya está registrado con otra identidad, si hay IDs o rutas duplicadas, si
una unidad reutiliza una página reservada o si la evidencia no confirma
parent → root → [contenedor opcional] → paquete e historial. No construir la evidencia por inferencia de
títulos: debe provenir del readback del conector activo.

Incluir las presentaciones registradas bajo su `remote_path`. Un cambio solo en portada,
historias editoriales o auxiliares se reporta como `presentation_drift`; no incorporarlo
automáticamente al Markdown ni sobrescribirlo sin clasificarlo.
`publish` queda bloqueado mientras exista drift no clasificado. Usar
`--ack-presentation-drift` solo después de registrar la decisión de conservarlo,
incorporarlo al canonical o recuperarlo.

Ejecutar primero:

```bash
refinement-sync status <project> --remote-dir <lectura-del-conector>
```

Para comenzar:

```bash
refinement-sync start <project> --remote-dir <lectura-del-conector>
```

Para publicar:

```bash
refinement-sync publish <project> --preview --remote-dir <lectura-del-conector>
```

Mostrar páginas, cambios, base/remoto/nuevo snapshot, contradicciones, respaldo y rollback.
El preview debe incluir la estrategia recomendada por unidad: `patch` para cambios pequeños
o páginas grandes y `replace` para reemplazos acotados. `preserve` nunca entra al write set.
La estrategia optimiza transporte; el readback final siempre compara la unidad completa.
Solicitar autorización para el write set exacto. Después:

```bash
refinement-sync publish <project> --apply --remote-dir <misma-lectura-remota>
```

`--apply` crea el respaldo y un outbox identificado por página; no escribe en Notion ni mueve
la base. Usar el conector activo para aplicar exactamente ese write set. Leer nuevamente las
páginas afectadas y finalizar con:

Cuando exista `audit_log_page_id`, proporcionar además `--change-author`,
`--publishing-actor`, `--authorized-by`, `--provider` y `--reason`. No inferir que el
actor de publicación escribió o aprobó el cambio.

```bash
refinement-sync publish <project> --verify --outbox <directorio> \
  --remote-dir <readback-del-conector>
```

Solo `--verify` puede actualizar el checkout y el snapshot base. No usar `--apply` por
autorización genérica o por una aprobación emitida antes del preview.
Después de `--verify`, crear con el conector la subpágina indicada por `audit_event` y
cerrar el receipt con:

Para cada historia editorial afectada, guardar su readback completo y construir un plan:

```json
{"project":"mi-proyecto","stories":[{"story_id":"US-01","canonical_path":"jira/US-01.md","presentation_path":"readback/US-01.md","notion_page_id":"uuid"}]}
```

Ejecutar `scripts/verify-editorial-parity.mjs --plan <plan.json> --out
<editorial-receipt.json>`. El comando exige IDs y comportamiento completo por escenario;
un resumen no pasa. Rerun `refinement-judge` con ese receipt como evidencia posterior a
Notion y guardar su reporte contra el snapshot final. Solo entonces cerrar auditoría:

```bash
refinement-sync audit <project> --complete --event <audit-event.json> \
  --entry-page-id <uuid> --editorial-receipt <editorial-receipt.json> \
  --judge-report <11-refinement-judge-report.md>
```

Un `FAIL` bloquea. Solo una excepción humana ya registrada en el reporte puede usar además
`--accept-judge-override`; debe nombrar acción de Notion, hallazgos, responsable, motivo y fecha.

No crear historial para `status`, previews, `start` sin publicación o intentos fallidos.
Crear cada entrada únicamente como hija de `audit_log_page_id`; nunca insertar eventos en
la portada, en `Paquete Markdown` ni en una página canónica.

Para conflictos, ejecutar `reconcile` con una lectura remota fresca. El reporte clasifica
cambios por unidad y exige decisión cuando ambos lados modificaron una misma unidad:

```bash
refinement-sync reconcile <project> --remote-dir <lectura-del-conector>
```

Para recuperar, revisar y preparar explícitamente un respaldo. El comando crea un outbox de
recuperación; el conector realiza la escritura y luego se verifica como una publicación:

```bash
refinement-sync recover <project> --preview --backup <directorio>
refinement-sync recover <project> --apply --backup <directorio> \
  --change-author <persona> --publishing-actor <actor> \
  --authorized-by <persona> --provider <ia/conector> --reason <motivo>
refinement-sync recover <project> --verify --outbox <directorio> \
  --remote-dir <readback-del-conector>
```

Para aceptar drift editorial compatible sin escribir en Notion:

```bash
refinement-sync baseline <project> --preview --remote-dir <lectura-del-conector>
refinement-sync baseline <project> --apply --remote-dir <misma-lectura> \
  --ack-presentation-drift --reason <decisión>
```

## Gates de publicación

Antes de escribir:

1. Comparar el snapshot remoto con la base local.
2. Ejecutar el validador estricto de `story-to-test-workflow`.
3. Ejecutar `refinement-judge` para la acción solicitada.
   En una actualización localizada, exigir además la validación de completitud del plan de
   impacto: consumidores omitidos, derivados stale o páginas editoriales contradictorias
   bloquean la publicación.
4. Bloquear ante contradicción semántica, cambio concurrente sobre la misma unidad o Judge
   `FAIL`.
5. Crear respaldo de las páginas afectadas.

Después de escribir:

1. Leer nuevamente cada página modificada.
2. Normalizar y comparar contenido e IDs.
3. Regenerar los Markdown locales desde el Notion verificado.
4. Ejecutar otra vez validación y paridad.
5. Ejecutar paridad editorial por historia y el Judge posterior a Notion.
6. Generar ZIP del checkout verificado y manifiesto SHA-256.
7. Marcar el nuevo snapshot como actual y cerrar auditoría únicamente al final.

Una respuesta HTTP exitosa no completa una publicación.

## Eficiencia segura

- Leer y escribir en lotes pequeños cuando las unidades sean independientes.
- Reintentar timeouts transitorios sin ampliar el write set.
- Preferir `patch` cuando el cambio sea localizado o la página sea grande; usar `replace`
  cuando sea más seguro y acotado.
- Reusar hashes verificados para unidades `preserve`; no volver a enviarlas. Mantenerlas en
  el snapshot final y bloquear si su base ya no es confiable.
- No reducir lectura previa de unidades afectadas, validación estricta, Judge, respaldo,
  readback completo de cada unidad escrita, auditoría, snapshot ni ZIP.

## Conflictos

Usar comparación `base → local → remoto`.

- Combinar automáticamente solo unidades independientes.
- Tratar como conflicto una contradicción semántica aunque ocurra en páginas diferentes.
- Conservar ambas versiones y generar un reporte con owner, artefactos afectados y pregunta
  concreta.
- No elegir por fecha, IA, formato ni ubicación.
- Propagar la decisión confirmada por `BR → US → AC → SC → CHK → FTC`.

## Resultado

Reportar:

- operación y proyecto;
- página raíz y manifiesto usados;
- snapshots base, remoto y final;
- páginas creadas, actualizadas, preservadas o en conflicto;
- validación y Judge;
- readback y equivalencia;
- ubicación del respaldo, ZIP, manifiesto y estado local;
- siguiente acción exacta.

Nunca afirmar sincronización si no hubo readback completo.
