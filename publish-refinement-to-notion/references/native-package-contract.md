# Contrato del paquete nativo de Notion

## Modos

### Publicación completa

Es el modo predeterminado cuando el usuario pide publicar, republicar o generar el refinamiento sin limitar la acción a páginas concretas. Crear o actualizar:

1. Portada del proyecto.
2. Una página autosuficiente por historia.
3. Las seis páginas auxiliares obligatorias.

### Actualización localizada

Usarla cuando el usuario nombra historias, secciones o páginas concretas. Actualizar solo ese alcance y cualquier conteo, estado, enlace o resumen de portada cuya verdad haya cambiado. Preservar las demás páginas y registrar qué quedó fuera del alcance.

No convertir automáticamente una corrección puntual en una republicación completa.

## Seis páginas auxiliares obligatorias

| Página nativa | Fuente canónica |
|---|---|
| Reglas, decisiones y preguntas | `02-rules-and-questions.md` |
| Plan funcional de pruebas | `07-functional-test-cases.md` |
| Matriz de cobertura y automatización | `06-test-coverage.md` y `10-automation-matrix.md`, cuando exista |
| Pendientes, riesgos y preparación | `08-traceability-and-risks.md` y readiness de `00-workflow-state.md` |
| Handoff DEV | `handoffs/dev-handoff.md` |
| Handoff QA | `handoffs/qa-handoff.md` |

Si `10-automation-matrix.md` no existe, utilizar exclusivamente la estrategia canónica por escenario registrada en `07-functional-test-cases.md`; no inventar otra clasificación.

Cada página debe:

- conservar IDs, idioma, estados, owners y relaciones;
- incluir el contenido completo necesario para su propósito;
- declarar el snapshot o fecha de la fuente;
- enlazar a la portada y, cuando aporte valor, a las historias relacionadas;
- evitar copiar escenarios con una redacción diferente a la canónica.

La portada debe enlazar estas páginas desde la sección 9 y conservar sus bloques nativos dentro del único desplegable final `Subpáginas internas del proyecto`. No mostrar esos bloques nuevamente como elementos sueltos.

## Ausencias legítimas

`No aplica` significa que el entregable no corresponde al alcance por una decisión explícita. `No generado` significa que falta el artefacto canónico requerido y debe indicar cuál falta.

La inexistencia previa de una página en Notion no es una razón válida para usar ninguno de esos estados. En una publicación completa, si existe el artefacto canónico aplicable, la página se crea.

## Identidad y duplicados

Antes de crear, buscar por destino, relación con la portada y título canónico. Actualizar la página ya enlazada desde la portada. No crear variantes como `Título (1)`, `Título nuevo` o `Título — fecha`.

Si existen duplicados:

1. conservar como canónica la página enlazada desde la portada o la que tenga identidad registrada en el manifiesto;
2. no borrar ni fusionar contenido ajeno sin autorización;
3. registrar los duplicados como observación y corregir los enlaces de navegación.

## Manifiesto y verificación

Registrar por página: tipo, título, URL, acción (`Creada`, `Actualizada`, `Preservada` o `No generada`), fuente canónica y snapshot.

En una publicación completa, volver a leer la portada, todas las páginas auxiliares y todas las historias. Confirmar:

- seis páginas auxiliares presentes y enlazadas;
- cantidad correcta de historias;
- títulos canónicos sin duplicados;
- misma versión del paquete;
- contenido derivado de su fuente asignada;
- ausencia de `No aplica` o `No generado` cuando la fuente aplicable sí existe.
- todos los bloques nativos de historias y materiales contenidos una sola vez dentro del desplegable final, sin duplicación visual.
