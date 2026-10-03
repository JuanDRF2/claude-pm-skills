# Contrato de validación de presentaciones de Notion

## Propósito

Impedir que una IA publique contenido completo con una estructura de lectura distinta a la
acordada. El ejemplo orienta; el receipt del validador hace cumplir los invariantes.

## Plan

Crear un JSON por publicación con las presentaciones afectadas:

```json
{
  "schema_version": 1,
  "project": "membership-online",
  "presentations": [
    {
      "type": "cover",
      "presentation_path": "readback/cover.md",
      "expected_story_ids": ["US-OM-01"],
      "development_destination": "<confirmed destination name>"
    },
    {
      "type": "story",
      "story_id": "US-OM-01",
      "canonical_path": "jira/US-OM-01.md",
      "presentation_path": "readback/US-OM-01.md"
    },
    {
      "type": "shared-contract-cover",
      "presentation_path": "readback/shared-contract-cover.md"
    }
  ]
}
```

Usar paths dentro del expediente congelado. `presentation_path` puede contener Markdown de
Notion o el JSON/texto completo devuelto por `fetch`; el validador extrae `<content>`.
Incluir `development_destination` con el nombre exacto únicamente cuando el equipo haya
confirmado ese destino. En ese caso el validador exige la nota enlazada de la sección 9.

## Ejecución

```bash
node scripts/validate-notion-presentation.mjs \
  --plan <presentation-plan.json> \
  --out <notion-format-receipt.json>
```

Ejecutar dos veces:

1. sobre los payloads finales antes de pedir autorización;
2. sobre el readback real después de publicar.

Ambos receipts deben tener `ok: true`. El segundo es obligatorio para promover la release a
`current`, ejecutar el Judge posterior y crear auditoría.

El esquema 1 valida `cover`, `shared-contract-cover` y `story`. Usa
`shared-contract-cover` únicamente cuando el manifiesto declare
`package_kind: shared-contract`; exige el resumen visible y siete secciones: Autoridad y
alcance, Comportamiento aprobado, Decisiones todavía abiertas, Paquetes consumidores,
Gobierno de cambios, Material técnico y Operación y auditoría. Un proyecto completo
continúa usando `cover` y sus diez secciones.

Los seis materiales auxiliares continúan bajo paridad
semántica y revisión del Judge; no incluirlos como un tipo inventado en este plan.

## Alcance

El validador revisa únicamente presentaciones creadas o afectadas. La validación local del
paquete y el análisis de impacto prueban que las demás no requerían actualización.

## División de responsabilidades

- El script valida estructura, navegación, IDs esperados, ubicación y ausencia de patrones
  obsoletos.
- `verify-editorial-parity.mjs` valida condiciones y Given/When/Then contra el canónico.
- El Judge valida claridad, reglas, decisiones, riesgos y equivalencia semántica.

Ninguno sustituye a los otros.
