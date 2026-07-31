# Contrato del manifiesto de páginas

Cada proyecto debe tener un manifiesto estable que relacione identidad semántica, página de
Notion y artefacto local.

```json
{
  "schema_version": 1,
  "project": "pay-by-link",
  "package_kind": "project",
  "notion_parent_page_id": "uuid-destino-elegido",
  "notion_root_page_id": "uuid-pagina-colaborativa-proyecto",
  "notion_internal_container_page_id": "uuid-subpaginas-internas-opcional",
  "notion_package_page_id": "uuid-paquete-markdown",
  "audit_log_page_id": "uuid-historial-sincronizacion",
  "audit_policy": "verified-events-only",
  "audit_entry_mode": "append-only-child-pages",
  "units": [
    {
      "id": "00-workflow-state",
      "role": "canonical",
      "notion_page_id": "uuid",
      "local_path": "00-workflow-state.md"
    },
    {
      "id": "US-PBL-01",
      "role": "derived",
      "notion_page_id": "uuid",
      "local_path": "jira/US-PBL-01.md"
    }
  ],
  "presentations": [
    {
      "id": "project-cover",
      "role": "presentation",
      "notion_page_id": "uuid",
      "remote_path": "_presentation/project-cover.md",
      "base_sha256": "sha256",
      "drift_policy": "review"
    }
  ]
}
```

## Reglas

- `notion_parent_page_id` identifica el destino elegido por el usuario.
- `notion_root_page_id` identifica la página colaborativa canónica, hija directa del destino.
- `notion_internal_container_page_id` es opcional. Cuando existe, identifica el único
  contenedor técnico hijo directo de la página colaborativa; no pertenece a `units` ni
  `presentations`.
- `notion_package_page_id` identifica el único `Paquete Markdown`. Es hijo directo del
  contenedor interno cuando este está declarado; de lo contrario, es hijo directo de la
  página colaborativa. Todas las unidades viven dentro de él o de sus contenedores.
- `audit_log_page_id` identifica el único `Historial de sincronización`, hermano de
  `notion_package_page_id` bajo el mismo padre. Resolverlo por ID y jerarquía, no solo por
  título.
- Registrar la portada colaborativa como `derived` si se incluye como unidad editorial;
  nunca sustituye a `00-workflow-state.md` ni participa como documento canónico.
- Publicar por `notion_page_id`, nunca por coincidencia de título.
- `canonical`: corresponde 1:1 a un Markdown fuente, puede originar cambios compartidos y participa en el snapshot.
- `derived`: corresponde 1:1 a un Markdown generado como `jira/*.md` o `handoffs/*.md`, o a una portada editorial; se regenera desde unidades canónicas y no acepta edición independiente.
- `operational`: manifiestos, receipts y respaldos; no es contenido de refinamiento.
- Una unidad canónica debe tener una sola página y una sola ruta local.
- No consolidar varios Markdown en una página. Un archivo agregado y las historias
  individuales conservan páginas separadas; clasificar como `derived` la vista generada,
  no omitirla.
- Cambiar el rol o identidad exige preview y autorización.
- Conservar páginas históricas fuera del manifiesto; no borrarlas automáticamente.
- Bloquear registro o publicación si no coincide una de las jerarquías válidas:
  padre→proyecto→paquete/historial o
  padre→proyecto→contenedor interno→paquete/historial.
- Cuando el manifiesto provenga de `discover`, conservar `discovery.read_at` y bloquear
  `register` mientras `discovery.unclassified_pages` no esté vacío. Clasificar manualmente
  esas páginas o registrarlas en un manifiesto independiente antes de continuar.
- Usar `package_kind: project | shared-contract | shared-standard`.
- Para `shared-contract`, registrar `owner_project`, `owner_notion_root_page_id` y
  `consumer_projects`. Su raíz es la página visible del contrato dentro del proyecto
  propietario y su `Paquete Markdown` sigue una de las dos jerarquías válidas.
- No mezclar unidades del contrato compartido con el manifiesto principal del propietario.
- Para `shared-standard`, registrar `owner_team` y exigir un destino compartido confirmado.
- Registrar en `presentations` toda página editorial cuya modificación deba detectarse.
  No participa en el snapshot canónico ni tiene `local_path`; usa `remote_path`,
  `base_sha256` y `drift_policy: review`.
- Calcular todos los hashes con la serialización `notion-inner-markdown-lf-v1` definida en
  `sync-contract.md`; registrar `transport_encoding: notion-inner-markdown-lf-v1`.
- Registrar `audit_log_page_id`, `audit_policy: verified-events-only` y
  `audit_entry_mode: append-only-child-pages`. La bitácora es operacional, queda fuera de
  `units`, `presentations` y del snapshot canónico.
- Registrar cada evento como página hija append-only del historial. No registrar eventos
  fallidos, previews, `status` o `start` sin publicación.
- Bloquear `publish`, `reconcile` y `recover` si el historial registrado está dentro de
  `Paquete Markdown`, bajo material editorial ajeno al contenedor técnico declarado,
  fuera de la raíz canónica o duplicado.
