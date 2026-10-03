# Contrato de páginas nativas rápidas

## Modelo

`native-pages-fast-v1` mantiene:

- un checkout Markdown del commit GitHub fuente bajo `artifacts/<slug>/`;
- una página de Notion por Markdown del manifiesto;
- presentaciones humanas derivadas para portada, historias y materiales;
- baseline y evidencia operacional bajo `artifacts/_local/notion-sync/<project>/`.

Requiere registrar repositorio, rama y commit fuente, pero no un plugin de GitHub, Notion
CLI ni tokens personales entregados por el usuario.

## Baseline inicial

La primera sesión debe leer todas las páginas registradas y guardar:

- identidad estable y ruta;
- SHA-256 local y remoto;
- contenido remoto serializado;
- snapshot del manifiesto y fecha de captura.

Es la única lectura completa obligatoria en el flujo normal. Repetirla solo si falta
evidencia, cambia el manifiesto, cambia la serialización, existe drift global demostrado o
el usuario solicita una auditoría total.

## Plan de impacto

El plan declara cada diferencia local exactamente una vez:

```json
{
  "schema_version": 1,
  "project": "membership-online",
  "units": [
    {"id": "02-rules-and-questions", "classification": "approved-scope", "reason": "BR actualizada"},
    {"id": "US-OM-06", "classification": "required-derivative", "reason": "consume la BR"}
  ],
  "excluded_units": [
    {"id": "05-user-stories-old", "classification": "historical-out-of-scope", "reason": "cambio previo no aprobado"}
  ],
  "presentations": [
    {"id": "project-cover", "classification": "required-derivative", "reason": "cambió el estado", "target_path": "_payloads/project-cover.md"}
  ]
}
```

Clasificaciones permitidas: `approved-scope`, `required-derivative`,
`historical-out-of-scope`, `deferred` y `rejected`. El plan falla si una diferencia local
no aparece en `units` o `excluded_units`, si una identidad se repite o si se omite un
consumidor afectado conocido. Una presentación sin `local_path` no es canon y no cuenta
como cambio local por sí sola; cuando deba actualizarse, el plan declara su `target_path`
con el payload derivado congelado.

Conserva `package_kind` desde el manifiesto hasta la validación y el Judge. Un
`shared-contract` usa su inventario reducido registrado y una presentación
`shared-contract-cover`; un proyecto normal no puede adoptar ese contrato por tener archivos
faltantes.

## Preflight remoto localizado

Antes de autorizar, proporcionar contenido remoto solo para `units` y `presentations`
seleccionadas. Para cada página:

1. comparar remoto con baseline mediante equivalencia Markdown;
2. comparar remoto con target;
3. clasificar `write`, `verification-only` o `conflict`;
4. congelar ID, hash previo, hash objetivo, payload y estrategia;
5. incluir backup y rollback localizado.

Una página `verification-only` no se respalda para escritura, no se reescribe y no ofrece
rollback. Un conflicto invalida la escritura dependiente, no obliga a releer páginas fuera
del alcance.

## Readback y baseline

Cada página escrita requiere un readback completo. Aceptar:

1. igualdad exacta; o
2. equivalencia `markdown-semantic` mediante el comparador versionado.

La equivalencia conservadora puede normalizar líneas vacías fuera de fences, separadores de
tabla, mentions y hosts de enlaces de Notion que mantengan el mismo page ID. Debe preservar
texto visible, orden, estructura funcional, IDs, links, tablas y Gherkin.

Actualizar de forma atómica únicamente las entradas verificadas del baseline. Las demás
conservan sus hashes y evidencia anteriores. Emitir un receipt con `verification_scope:
localized` y no afirmar alineación global.

## Comandos

```bash
node scripts/fast-sync.mjs capture \
  --manifest <manifest.json> --local-dir <checkout> \
  --remote-dir <captura-completa> --out <baseline.json>

node scripts/fast-sync.mjs plan \
  --manifest <manifest.json> --baseline <baseline.json> \
  --local-dir <checkout> --impact <impact-plan.json> --out <local-plan.json>

node scripts/fast-sync.mjs preflight \
  --manifest <manifest.json> --baseline <baseline.json> \
  --local-dir <checkout> --remote-dir <solo-afectadas> \
  --plan <local-plan.json> --out <dossier.json>

node scripts/fast-sync.mjs verify \
  --manifest <manifest.json> --baseline <baseline.json> \
  --local-dir <checkout> --readback-dir <solo-escritas> \
  --dossier <dossier.json> --out <receipt.json> \
  --updated-baseline <baseline-next.json>
```

Los directorios remotos usan `remote_path` cuando existe; de lo contrario `local_path`.
El conector sigue siendo responsable de leer y escribir Notion. El script calcula planes,
conflictos, equivalencia y evidencia; nunca realiza llamadas remotas.
