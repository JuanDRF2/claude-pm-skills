# Contrato de ejecución y reanudación de publicación

## Propósito

Aplicar un expediente autorizado una sola vez, verificar cada página de forma independiente
y reanudar únicamente lo pendiente. Este contrato no cambia los Markdown, la arquitectura
editorial ni los gates de producto.

## Estado por página

Inicializar `publication-run.mjs` con el expediente autorizado. Toda página recorre estados
explícitos:

```text
pending → written → verified-exact | verified-semantic | verified-three-way
        ↘ failed-unchanged | failed-unknown | blocked
```

Una página `verification-only` puede recorrer `pending → verified-exact` sin escritura.
Debe tener `remote_sha256 = target_sha256`, un readback completo y evidencia hash. No cuenta
en el write set, backup, rollback ni alcance del Judge.

- `failed-unchanged`: la escritura falló y el remoto conserva el hash previo; puede
  reintentarse sin rollback.
- `failed-unknown`: la respuesta no prueba si cambió; releer solo esa página antes de
  decidir.
- Una página verificada queda fuera de continuaciones posteriores y nunca se reescribe para
  “mantener el lote unido”.
- Un proyecto verificado puede cerrar independientemente; una falla en otro proyecto no
  invalida su resultado.

Usar:

```bash
node scripts/publication-run.mjs init --run <run.json> --dossier <publication-dossier.json>
node scripts/publication-run.mjs record --run <run.json> --page-id <id> --state <estado> \
  --evidence <receipt>
node scripts/publication-run.mjs metric --run <run.json> \
  --metric <metadata_checks|metadata_pages_checked|content_reads> --count <n>
node scripts/publication-run.mjs continue --run <run.json> --out <continuation-dossier.json>
node scripts/publication-run.mjs close --run <run.json> \
  --out <publication-run-receipt.json> --final-snapshot <sha256>
```

El expediente de continuación conserva el digest autorizado y contiene solo páginas no
verificadas. Pedir nueva autorización únicamente cuando cambie payload, estrategia, alcance,
metadata remota o digest; una reanudación idéntica no es un write set nuevo.

## Estrategia localizada

El motor genera patches solo con anclas únicas y simulación local exacta. Si el ancla es
ambigua, falta o la simulación no produce el hash objetivo, degradar a `replace` antes de la
autorización. No improvisar un patch usando la página completa como texto de búsqueda.

Después de un patch, comparar `base → target → readback` mediante `three-way-patch`. Aceptar
únicamente igualdad exacta o transformaciones conservadoras conocidas de Notion. No relajar
el comparador global para resolver una sola página.

## Equivalencia Markdown conservadora

Serializar cada respuesta completa de `fetch` antes de comparar o guardar readback:

```bash
node scripts/serialize-notion-fetch.mjs --out <readback.md> \
  [--base <base.md> --manifest <manifest.json> --unit-id <id>] < <fetch-response.json>
```

No reconstruir tablas o bloques manualmente cuando este serializador legacy aplica.

Puede normalizar solamente, con evidencia localizada y casos negativos:

- saltos LF, salto final y líneas vacías fuera de fences;
- H1 inicial representado por el título nativo;
- separadores de tablas sin cambio en celdas;
- escape automático de `$`;
- énfasis alrededor de código inline;
- fragmentos contiguos de un mismo enlace;
- un enlace relativo y su URL de Notion cuando el manifiesto prueba el mismo page ID.
- hosts `notion.so` y `app.notion.com/p` con el mismo page ID, etiqueta y posición;
- separadores vacíos alrededor de párrafos y listas cuando texto, cantidad, orden, nivel y
  límites de bloque permanecen idénticos.

No puede ignorar texto, destinos de enlaces, IDs, código, dinero, fechas, estados,
porcentajes, reglas, celdas, orden, nivel o anidación de listas, ni headings internos.
Registrar `exact`, `markdown-semantic` o
`three-way-patch` en el receipt.

## Enlaces internos

Antes de congelar un payload, ejecutar `resolve-notion-links.mjs resolve` con el manifiesto.
Todo enlace relativo a otro Markdown debe convertirse a la página de Notion registrada.
Bloquear URLs inventadas con forma `https://*.md` y destinos sin identidad. Después del
readback, ejecutar `validate` para confirmar el destino funcional, no solo el texto visible.

## Rendimiento y freshness

1. Capturar contenido completo una vez al crear el baseline inicial.
2. Revisar y validar localmente el paquete completo.
3. Consultar contenido remoto solo de páginas afectadas para el preflight de tres vías.
4. Reutilizar ese receipt en preview y autorización mientras su hash, plan y alcance no
   cambien.
5. Inmediatamente antes de cada write, comprobar solo esa página afectada.
6. Después, releer contenido completo solo de páginas escritas o `verification-only`.

No repetir el inventario completo porque cambió un archivo operativo, se regeneró un Judge
local o se creó un preview. Una página fuera del alcance no se escribe y no necesita
freshness en esa ejecución. Repetir inventario completo solo por baseline inicial,
manifiesto/serializador incompatible, señal demostrada de drift global o solicitud expresa.

Registrar por ejecución tiempos, un único freshness gate, páginas de metadata comprobadas,
lecturas completas, escrituras y reintentos. `record` cuenta automáticamente escrituras y
reintentos; `metric` registra lecturas. Exceder el presupuesto operativo requiere una razón
explícita antes de continuar, no ampliar silenciosamente el trabajo.

`close` exige todas las páginas del alcance verificadas con evidencia hash, cobertura
completa de ese alcance y readback, métricas coherentes y presupuestos respetados. Genera un receipt
inmutable con estados por página, proyectos, timestamps, duración y métricas. Para varios
proyectos, usar `--project-snapshots <json>`.

Para recuperación legacy, seguir además `legacy-recovery-contract.md`; para receipts y
checkpoints, `evidence-integrity-contract.md`.

## Paridad y Judge posterior

Verificar todas las presentaciones escritas, no solo historias: portada, historias y páginas
auxiliares. Usar `verify-presentation-parity.mjs` y mantener aparte el receipt detallado de
historias cuando corresponda.

Cada proyecto exige un Judge posterior con:

```text
Action stage / Etapa de acción: Post-publication
Action scope / Alcance de acción: technical=N; editorial=N
```

Debe revisar el snapshot final exacto y quedar enlazado en el receipt aun cuando no se haya
modificado una historia editorial.

## Auditoría idempotente

Después del readback, la paridad y los Judges, congelar un expediente de auditoría con:

- padre, título, payload y SHA-256;
- snapshot final;
- Judge posterior y receipts de paridad;
- identidad esperada `parent + title`.

Validarlo con `validate-audit-dossier.mjs`. Antes de crear, buscar esa identidad y payload:
si ya existe y su readback coincide, adoptar la entrada; si hay otra con el mismo título y
distinto payload, bloquear. El cierre de `refinement-sync audit --complete` exige
`--entry-receipt`, `--presentation-receipt` y `--judge-report`; el receipt de entrada registra
ID, padre, título, hash del payload, hash de readback, timestamp y cero duplicados.

Finalmente ejecutar `validate-final-receipt.mjs`. El receipt final usa esquema 3 y enlaza
por ruta y SHA-256 el `publication-run-receipt.json`, copiando sus conteos, métricas,
presupuestos, inicio, fin y duración. El validador confirma esas copias, cada evidencia de
página y el snapshot del proyecto. No declarar completada una publicación solo porque las
escrituras recibieron HTTP exitoso.
