# Contrato del documento de refinamiento

## Fuentes

| Archivo | Uso |
|---|---|
| `01-project-understanding.md` | Objetivo, resultado, alcance y actores |
| `02-rules-and-questions.md` | Definición canónica de reglas y preguntas |
| `05-user-stories.md` | Historias, alcance y criterios |
| `06-test-coverage.md` | Definición canónica de comprobaciones `CHK` |
| `07-functional-test-cases.md` | Casos `FTC`, escenarios `SC` y automatización |
| `08-traceability-and-risks.md` | Pendientes, bloqueos y riesgo residual |
| `11-refinement-judge-report.md` | Veredicto, hallazgos y autorización del gate, cuando exista |

## Estructura editorial

1. Portada breve: proyecto, estado, alcance, fecha e idioma.
2. Cómo leer: significado humano de `US`, `AC`, `BR`, `CHK`, `FTC` y `SC`.
3. Resumen: objetivo, incluido, excluido, entregas, decisiones principales y veredicto de `Refinement Judge` cuando exista.
4. Una sección por historia:
   - historia y valor;
   - estado, alcance y dependencias;
   - criterios verticales;
   - reglas completas usadas por cada criterio;
   - checks con riesgo, nivel y evidencia;
   - escenarios relacionados resumidos;
   - estrategia QA completa por escenario: decisión de automatización, nivel recomendado, prioridad, razón, dependencias y estado;
   - casos funcionales relacionados.
5. Plan funcional transversal.
6. Pendientes y riesgos reales.
7. Anexo de trazabilidad cuando aporte valor.
8. Anexo de revisión adversarial con hallazgos y autorización del gate cuando exista.

## Control de densidad

- No repetir el escenario completo en cada criterio y nuevamente en el caso funcional. Bajo el criterio mostrar Given/When/Then, evidencia y los seis campos canónicos de estrategia QA; en el caso funcional conservar preparación, datos y ejecución completa.
- Iniciar cada historia en página nueva cuando el documento incluya más de una.
- Mantener juntos encabezados y al menos el primer bloque que explican.
- Evitar tablas con párrafos largos. Cambiar a secciones etiquetadas.
- Usar color solo para jerarquía, estados y callouts; mantener contraste accesible.

## Conteos de control

La publicación debe conservar:

- todas las `US-*` aprobadas del alcance seleccionado;
- todos sus `AC-*`;
- toda relación explícita con `BR-*`, `CHK-*`, `FTC-*` y `SC-*`;
- estados de revisión y automatización sin reinterpretarlos;
- para cada `SC-*`: decisión, nivel, prioridad, razón, dependencias y estado exactamente como aparecen en la fuente canónica.

La publicación debe detenerse si alguno de esos seis campos falta. El generador no puede completar valores, derivarlos del riesgo ni sustituirlos por recomendaciones genéricas.

Un escenario o caso puede aparecer relacionado con varios criterios; eso no implica duplicarlo en la fuente.
