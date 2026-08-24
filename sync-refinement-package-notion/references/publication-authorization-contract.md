# Contrato del expediente de autorización

## Propósito

Congelar el cambio remoto exacto antes de pedir autorización. El expediente une el write
set técnico, los payloads editoriales, las exclusiones, los Judges y las auditorías
condicionadas. No sustituye el readback ni autoriza por sí mismo una escritura.

## Orden

1. Resolver vigencia remota de las páginas afectadas contra el baseline actual.
2. Generar los payloads editoriales finales bajo
   `artifacts/_local/notion-publication-previews/<timestamp>/`.
3. Ejecutar los previews técnicos con los planes vigentes.
4. Ejecutar el Judge para la acción `Publication` y el alcance exacto por proyecto.
5. Crear `publication-dossier.json`, validarlo y mostrar su digest junto al preview humano.
6. Pedir autorización solamente para ese digest y esas páginas.

Después de autorizar, inicializar el estado por página de
`publication-execution-contract.md`. Una continuación conserva este digest y excluye páginas
ya verificadas; no solicitar otra autorización por una reanudación idéntica.

Si el validador falla, corregir localmente y volver a validar sin preguntar al usuario ni
descargar nuevamente contenido remoto. Consultar metadata fresca solo inmediatamente antes
de escribir. Un cambio remoto invalida el expediente afectado.

## Esquema mínimo

```json
{
  "schema_version": 3,
  "intended_action": "notion_localized_publication",
  "authorization_status": "pending",
  "technical_pages": [{
    "project": "project-key",
    "unit_id": "05-user-stories",
    "notion_page_id": "uuid",
    "strategy": "patch",
    "source_path": "artifacts/project/05-user-stories.md",
    "remote_sha256": "64-hex",
    "target_sha256": "64-hex"
  }],
  "editorial_pages": [{
    "project": "project-key",
    "presentation_id": "story:US-01",
    "notion_page_id": "uuid",
    "classification": "update-complete",
    "strategy": "patch",
    "payload_path": "artifacts/_local/notion-publication-previews/run/project/US-01.md",
    "remote_sha256": "64-hex",
    "target_sha256": "64-hex",
    "source_ids": ["US-01", "AC-01-01"],
    "reason": "Alinear el comportamiento aprobado"
  }],
  "verification_pages": [{
    "project": "project-key",
    "page_type": "technical",
    "identity": "04-release-slices",
    "notion_page_id": "uuid",
    "payload_path": "artifacts/project/04-release-slices.md",
    "remote_sha256": "64-hex",
    "target_sha256": "64-hex",
    "reason": "El remoto ya coincide con el payload aprobado"
  }],
  "excluded_units": [{
    "project": "project-key",
    "unit_id": "jira::US-OLD-01",
    "classification": "historical_out_of_scope",
    "local_sha256": "64-hex",
    "remote_sha256": "64-hex"
  }],
  "judge_reports": [{
    "project": "project-key",
    "report_path": "artifacts/project/11-refinement-judge-report.md",
    "report_sha256": "64-hex",
    "technical_count": 1,
    "editorial_count": 1
  }],
  "freshness_receipts": [{
    "project": "project-key",
    "receipt_path": "artifacts/_local/notion-publication-previews/run/project/freshness-receipt.json",
    "receipt_sha256": "64-hex",
    "expected_page_count": 3,
    "verification_scope": "localized"
  }],
  "audit_entries": [{
    "project": "project-key",
    "parent_page_id": "uuid",
    "trigger": "verified_readback",
    "payload_source": "verified_receipt"
  }],
  "controls": {
    "freshness_before_write": true,
    "full_readback_written_pages": true,
    "backup_before_write": true,
    "rollback_from_backup": true
  },
  "expected_totals": {
    "technical_pages": 1,
    "editorial_pages": 1,
    "verification_pages": 1,
    "excluded_units": 1,
    "freshness_pages": 3,
    "audit_entries": 1
  }
}
```

## Reglas

- `source_path` y `payload_path` son relativos a la raíz pasada al validador y deben existir.
- `target_sha256` debe coincidir con el contenido exacto de ese archivo en el momento de
  autorización. Nunca generar el payload editorial después de la aprobación.
- Cada página remota aparece una sola vez entre write sets. Cada unidad excluida queda fuera.
- `verification_pages` contiene solamente no-ops demostrados con
  `remote_sha256 = target_sha256`; se releen, pero no se respaldan para escritura, escriben
  ni cuentan en el alcance del Judge.
- `patch` y `replace` cambian el transporte, no el estándar de readback completo.
- Un `patch` debe incluir ancla única y simulación local exacta; si no las cumple, congelar
  `replace` antes de pedir autorización.
- Una historia usa `update-complete`; `summary-link` solo aplica a portadas o auxiliares cuya
  responsabilidad permita resumir.
- El Judge de cada proyecto declara `Action stage / Etapa de acción: Publication` y
  `Action scope / Alcance de acción: technical=N; editorial=N`. Los conteos deben coincidir
  con el expediente y su veredicto debe permitir la acción.
- Cada proyecto aporta evidencia fresca de todas las páginas que pueden escribirse o son
  `verification-only`. En una actualización localizada, el conteo coincide con ese alcance,
  no con todo el manifiesto. Solo una publicación inicial, `full-audit` o recuperación
  legacy explícita exige inventario completo. El expediente liga cada receipt por SHA-256.
- `Observation` o `Low` no puede declarar que bloquea la acción. Un hallazgo abierto
  `Critical`, `High` o `Medium` sí la bloquea y exige `FAIL`.
- Las auditorías se autorizan como escrituras condicionadas: su contenido se deriva del
  receipt verificado y solo se crea después del readback, paridad y Judge posterior.
- Resolver y congelar enlaces internos antes de calcular el hash objetivo. Una URL con
  destino `.md` o un destino sin page ID registrado bloquea el expediente.
- La autorización identifica el SHA-256 que emite el validador. Cualquier cambio de archivo,
  plan, payload, Judge o alcance exige regenerar el expediente y pedir otra autorización.

## Validación

```bash
node scripts/validate-publication-dossier.mjs \
  <publication-dossier.json> --root <workspace-root>
```

El comando falla ante payloads ausentes o mutados, freshness incompleta del alcance, receipts no
vigentes, campos incompletos, identidades duplicadas, conteos inconsistentes, Judges de
preview o incoherentes y controles de seguridad desactivados. Su salida entrega
`DOSSIER_SHA256`; usar ese valor en la solicitud humana de autorización.
