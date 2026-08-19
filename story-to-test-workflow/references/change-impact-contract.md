# Contrato de impacto de cambios

Usar este contrato después de una decisión aprobada y antes de regenerar derivados o
publicar. Optimizar escrituras, nunca propagación ni validación.

## Grafo obligatorio

Resolver consumidores por IDs y relaciones explícitas:

```text
BR/MAP → US → AC → SC
SC → CHK/evidencia y decisión de automatización
FTC agrupa SC
05-user-stories*.md → jira/*.md → payload técnico → presentación editorial
Jira, handoffs y vistas consumen los IDs y el formato funcional que presentan
```

No decidir impacto por coincidencia de palabras, tamaño del diff o proximidad de archivos.
Bloquear ante referencias rotas, consumidores huérfanos, derivados no regenerables o una
contradicción semántica.

## Responsabilidad documental

| Artefacto | Actualizar cuando cambie |
|---|---|
| `00-workflow-state.md` | checkpoint, gate, stale consumers o siguiente acción |
| `01-project-understanding.md` | objetivo, actor, alcance o sistema conocido |
| `02-rules-and-questions.md` | regla, decisión, excepción, owner o pregunta |
| `03-story-map.md` | actividad, paso, variante o recuperación |
| `04-release-slices.md` | entrega, dependencia, orden o alcance diferido |
| `05-user-stories.md` | outcome, alcance, criterio o comportamiento de una historia |
| `05-user-stories*.md` | igual que el volumen principal cuando las historias están divididas por dominio |
| `06-test-coverage.md` | riesgo, check, evidencia, nivel o cobertura |
| `07-functional-test-cases.md` | precondición, datos, escenario o resultado esperado |
| `08-traceability-and-risks.md` | relación o riesgo residual |
| `09-package-index.md` | inventario, estado, snapshot o navegación |
| `10-design-and-spec-deltas.md` | diferencia material de diseño o SPEC, cuando aplique |
| matrices aplicables | combinación, dataset o decisión de automatización |
| `jira/*.md` | historia consumidora afectada |
| `handoffs/dev-handoff.md` | instrucción, dependencia, fallo u observabilidad necesaria para DEV |
| `handoffs/qa-handoff.md` | estrategia, escenario, evidencia, datos o riesgo necesario para QA |
| `11-refinement-judge-report.md` | snapshot, alcance revisado, hallazgo o veredicto |

La existencia de una relación no obliga a reescribir el consumidor: actualizarlo solo si
su contenido final cambia. Conservarlo cuando siga completo y correcto.

Tratar como impacto propagable el formato que protege significado o transporte: código
inline que evita autolinks, estructura y nivel de listas, destinos de enlaces y fences. Una
variación puede no cambiar la regla de producto y aun así exigir regenerar Jira, payload o
presentación. El validador debe comparar todos los volúmenes `05-user-stories*.md` contra
sus derivados Jira, no solamente `05-user-stories.md`.

## Plan de impacto

Antes de escribir, producir para cada unidad:

- `update`: cambia contenido propio;
- `metadata-only`: solo cambia estado, conteo, snapshot, enlace o inventario;
- `preserve`: su contenido final sigue correcto;
- `blocked`: falta una relación, decisión o regeneración segura.

Registrar la razón y los IDs originadores. El write set contiene únicamente `update` y
`metadata-only`; `preserve` permanece en el snapshot completo y se valida por su hash.
No clasificar un consumidor como `preserve` sin evidencia exacta de que sigue derivando de
la fuente canónica vigente.

## Gates

1. Regenerar los derivados realmente afectados.
2. Ejecutar validación estricta sobre el paquete completo.
3. Ejecutar el Judge antes de publicar decisiones de producto.
4. En actualización localizada, exigir al Judge comprobar completitud del plan: ningún
   consumidor afectado puede quedar en `preserve` sin evidencia de que sigue correcto.
5. Leer nuevamente cada unidad escrita y exigir equivalencia completa. Validar el paquete
   y el grafo completos reutilizando los hashes verificados de las unidades `preserve`.
   En publicación inicial, leer y verificar todas las unidades.

No declarar éxito si no puede demostrarse equivalencia del paquete final completo.
