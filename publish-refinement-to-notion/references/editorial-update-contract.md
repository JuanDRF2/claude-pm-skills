# Contrato de actualización editorial localizada

Mantener la misma experiencia final con el menor write set seguro. Una página se actualiza
por responsabilidad documental, no para repetir que otra página cambió.

## Matriz de decisión

| Página | Actualizar cuando | Puede resumir o enlazar |
|---|---|---|
| Portada | cambia estado, Judge, inventario, decisión crítica, riesgo principal o próximo paso | Sí; es navegación y resumen |
| Historia | cambia outcome, alcance, regla aplicable, criterio, escenario, riesgo o readiness | No para comportamiento; debe seguir autosuficiente |
| Reglas | cambia una regla, decisión, excepción, owner o pregunta | No para la definición de la regla |
| Plan funcional | cambia un caso, escenario, dato, precondición o resultado | No para el escenario necesario |
| Matriz | cambia cobertura, nivel, prioridad, evidencia o automatización | Sí para contexto ya definido en historia/reglas |
| Riesgos | cambia un riesgo, control, owner o residual | Sí para comportamiento que no altera el riesgo |
| Handoff DEV | cambia una instrucción, dependencia, fallo u observabilidad ejecutable | Sí para contexto de producto ya autosuficiente en la historia |
| Handoff QA | cambia estrategia, datos, evidencia, escenario o riesgo ejecutable | Sí para contexto ya completo en casos/historia |

## Reglas

1. Clasificar cada presentación como `update`, `summary-link`, `preserve` o `blocked` y
   registrar la razón e IDs originadores.
2. No agregar un bloque fechado idéntico a todas las páginas auxiliares.
3. Usar actualización localizada del bloque responsable; evitar reemplazo completo salvo
   que la arquitectura editorial deba regenerarse.
4. Preservar una página cuando su contenido final siga completo y correcto.
5. Leer nuevamente cada página escrita. Verificar presencia única, ubicación correcta,
   enlaces, IDs y ausencia de contradicciones con el Markdown.
6. La portada puede resumir y enlazar. Historias, reglas, criterios y casos no pueden
   depender de un enlace para comprender o aprobar el comportamiento.
7. Una publicación localizada conserva el mismo inventario, jerarquía y contratos de la
   publicación completa; solo reduce escrituras redundantes.
8. Una historia afectada nunca puede usar `summary-link`. Sus estados válidos son
   `update-complete`, `preserve-verified` o `blocked`.
9. Después del readback, invocar `sync-refinement-package-notion` para comparar cada
   historia contra `jira/<US-ID>.md` con su verificador incluido. Exigir el contenido de
   cada criterio, todos los `SC`, `CHK`, `FTC` y las cláusulas de cada escenario.
10. Un resumen fechado, un enlace o la mera presencia del `US-ID` no prueba paridad.
