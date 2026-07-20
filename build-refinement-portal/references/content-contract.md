# Contrato de contenido

## Fuentes esperadas

Aceptar nombres equivalentes, pero preferir esta estructura:

| Fuente | Responsabilidad |
|---|---|
| `02-rules-and-questions.md` | Catálogo canónico de reglas y preguntas abiertas |
| `05-user-stories.md` o `jira/*.md` | Historia, alcance y criterios de aceptación |
| `06-test-coverage.md` | Definición canónica de cada comprobación `CHK` |
| `07-functional-test-cases.md` | Casos funcionales `FTC` y escenarios `SC` |
| `08-traceability-and-risks.md` | Trazabilidad, bloqueos, revisiones pendientes y riesgo residual |

## Relaciones

```text
Proyecto
└── US — Historia de usuario
    ├── AC — Criterio de aceptación
    │   ├── BR — Regla de negocio
    │   └── CHK — Comprobación de cobertura
    │       └── SC — Escenario de prueba que la cubre
    └── FTC — Caso funcional
        └── SC — Escenario de prueba
```

Un `FTC` o `SC` puede cubrir múltiples criterios. Mostrarlo bajo cada criterio relacionado sin duplicarlo en la fuente.

## Campos mínimos del CHK

- Identificador.
- Historia.
- Criterio o calidad relacionada.
- Reglas.
- Qué debe comprobarse.
- Riesgo.
- Nivel recomendado.
- Resultado observable o evidencia.
- Estado.
- Escenarios que lo cubren, derivados desde `07-functional-test-cases.md`.

## Riesgos

Incluir únicamente:

- preguntas abiertas;
- decisiones pendientes;
- dependencias no resueltas;
- supuestos que necesitan confirmación;
- riesgos residuales relevantes para la historia.

Excluir matrices `AC → BR → CHK → SC`; pertenecen a cobertura o trazabilidad.

## Compatibilidad de idioma

Preservar el idioma de los artefactos. Traducir solamente etiquetas de navegación cuando exista una decisión explícita del proyecto. Nunca traducir silenciosamente historias o reglas.
