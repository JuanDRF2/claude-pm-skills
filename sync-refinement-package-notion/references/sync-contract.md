# Contrato de sincronización

## Autoridad

Notion es la fuente compartida. Markdown es un checkout local ligado a un snapshot. El ZIP
es respaldo y portabilidad, no una fuente editable paralela.

## Transporte

La autenticación pertenece al actor que ejecuta el flujo. Usar la conexión de Notion de la
IA activa y validar workspace, actor y capacidades antes de leer. Otra IA usa su propio
conector; el paquete no solicita, comparte ni administra tokens.

El transporte entrega Markdown identificado por `unit.id` al motor neutral. El motor
calcula snapshots, detecta conflictos y decide si una escritura es segura; el conector no
reimplementa esas reglas. No guardar tokens ni asumir que una conexión de una IA puede
exportarse a otra.

### Serialización estable

Para cada página nativa, guardar únicamente el Markdown interior de `<content>`, sin el
envoltorio `<page>`, propiedades ni metadatos del conector. Codificar en UTF-8, convertir
saltos de línea a LF y terminar con exactamente un salto de línea. Conservar el resto de
los bytes Markdown, incluidos espacios significativos. Aplicar la misma normalización a unidades y presentaciones antes de calcular
SHA-256. Una respuesta truncada o sin `<content>` válido no es serializable.

## Estado

Guardar bajo `artifacts/_local/notion-sync/<project>/`:

- `base.json`: snapshot y hashes cargados al comenzar;
- `remote.json`: última lectura remota;
- `working.json`: hashes locales;
- `backups/<timestamp>/`: contenido remoto previo a una publicación;
- `conflicts/<timestamp>.json`: conflictos sin resolver;
- `receipts/<timestamp>.json`: readback final.

## Snapshot

Calcularlo sobre contenido normalizado y la identidad estable de cada unidad, no sobre URLs
pre-firmadas de archivos, timestamps de Notion ni datos operativos.

Los comentarios no cambian el snapshot. Una decisión discutida en comentarios solo cambia
el snapshot cuando se incorpora al contenido canónico.

## Start

1. Leer el manifiesto de páginas.
2. Descargar todas las unidades canónicas.
3. Fallar ante truncación o bloque desconocido no resuelto.
4. Comparar base, remoto y local.
5. Actualizar automáticamente solo cuando el local no tenga cambios.
6. Conservar ambos lados y pasar a reconciliación cuando local y remoto cambiaron.

## Publish

1. Generar preview desde una lectura remota fresca.
2. Validar y ejecutar Judge.
3. Respaldar cada página afectada.
4. Aplicar cambios localizados cuando sea posible.
5. Actualizar el registro/snapshot actual al final.
6. Leer todo nuevamente y reconstruir local.
7. Si falla, mantener el snapshot anterior y ofrecer `recover`.
8. Después del readback, generar un ZIP del checkout verificado y su manifiesto SHA-256.

## Reconciliación

Usar comparación de tres vías. La ausencia de colisión textual no prueba compatibilidad:
ejecutar validación de IDs, trazabilidad y contradicciones antes de combinar.

`reconcile` clasifica y reporta; no escribe ni decide. Una resolución aprobada modifica el
checkout local o adopta el remoto mediante `start`, y cualquier escritura en Notion pasa
por `publish --preview`, `--apply` y `--verify`. El evento auditable pertenece a esa
operación verificada, no al análisis de reconciliación.

## Drift de presentación

Registrar portada, historias editoriales y páginas auxiliares relevantes en
`manifest.presentations` y comparar su hash remoto con `base_sha256`.

- `presentation_drift`: clasificar como mejora editorial, decisión canónica nueva o
  edición accidental antes de regenerar.
- Una mejora compatible puede conservarse y actualizar su baseline.
- Una decisión nueva se incorpora primero a la unidad canónica correspondiente.
- Una edición accidental se recupera desde el último snapshot verificado.

El drift editorial no convierte una página derivada en fuente canónica.
Actualizar un baseline solo con `baseline --preview` y `baseline --apply
--ack-presentation-drift`, después de readback y una razón registrada. Esta operación no
cambia Notion.

## Historial de sincronización

Cada proyecto registra `audit_log_page_id`. Crear una subpágina append-only únicamente
después de una publicación o recuperación verificadas. Una reconciliación o decisión de
gobernanza se registra cuando su cambio se materializa y verifica mediante una de esas
operaciones. Registrar separadamente autor del cambio, actor de publicación, autorizador,
autor de la decisión e IA/conector. No inventar identidades ni asumir que son la misma
persona.

`Historial de sincronización` es hermano de `Paquete Markdown`. Ambos son hijos directos
del contenedor interno registrado cuando existe; en manifiestos sin ese campo, ambos son
hijos directos de la raíz canónica. Es único por manifiesto y jerarquía, no por
coincidencia de título. La portada
lo enlaza después de `Paquete Markdown` en la sección 9 y agrupa su bloque `<page>` bajo
`Operación y auditoría`. Para `shared-contract`, aplicar la misma regla dentro de la página
visible del contrato propietario.

El historial visible queda fuera del snapshot canónico. El receipt local conserva hashes,
IDs, backup, outbox y rollback. Si la publicación se verificó pero falla la entrada de
Notion, marcar `pending_notion_entry` y reintentar sin repetir la publicación.
