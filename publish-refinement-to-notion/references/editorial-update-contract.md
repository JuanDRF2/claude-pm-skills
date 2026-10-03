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
7. Una publicación localizada conserva las páginas técnicas y humanas no afectadas; no las
   relee ni reescribe sin una dependencia demostrada.
8. Una historia afectada nunca puede usar `summary-link`. Sus estados válidos son
   `update-complete`, `preserve-verified` o `blocked`.
9. Después del readback, invocar `sync-refinement-package-notion` para comparar cada
   historia contra `jira/<US-ID>.md` del checkout validado. Exigir el contenido de
   cada criterio, todos los `SC`, `CHK`, `FTC` y las cláusulas de cada escenario.
10. Un resumen fechado, un enlace o la mera presencia del `US-ID` no prueba paridad.
11. Antes de solicitar autorización, materializar cada página `update-complete` o
    `summary-link` como un payload Markdown final bajo
    `artifacts/_local/notion-publication-previews/<timestamp>/`.
12. Registrar por payload: `presentation_id`, `notion_page_id`, clasificación, IDs fuente,
    estrategia `patch/replace`, `remote_sha256`, `payload_path` y `target_sha256`.
13. El hash objetivo identifica el payload congelado; el readback se valida por equivalencia
    semántica conservadora y campos materiales, no por serialización Markdown idéntica. No
    autorizar una intención editorial ni generar el texto final después de la aprobación.
14. Pasar los payloads al expediente de `sync-refinement-package-notion` y exigir su
    validación antes de pedir permiso remoto. Una falla aquí se corrige localmente sin nueva
    descarga completa mientras la sesión de revisión continúe vigente.
15. Resolver enlaces relativos con el manifiesto antes de calcular `target_sha256`. Rechazar
    destinos web terminados en `.md` y validar el page ID de cada enlace tras el readback.
16. Después de escribir, emitir paridad para cada presentación afectada, incluso portada y
    auxiliares; la paridad profunda de historias continúa siendo adicional y obligatoria.
17. Prohibir `replace` en portadas o páginas con subpáginas/bloques no administrados. Usar
    patch con sección administrada o bloquear antes de la autorización.
