# Contrato de entendimiento y recorrido — `project-context-v1`

Lee este contrato al crear un proyecto completo o cuando una revisión modifica
materialmente el entendimiento, alcance o recorrido de Gate 1. No aplica a
`shared-contract` sin journey propio.

## Adopción y compatibilidad

Registra en `00-workflow-state.md`:

```markdown
- Context artifact contract / Contrato de artefactos de contexto: project-context-v1
```

Los paquetes anteriores sin esta declaración conservan su estructura. Cuando Gate 1 se
reabre por un cambio material, adopta el contrato en los dos documentos dentro del mismo
change set; no modernices un paquete intacto solo por formato.

## Separación de responsabilidades

- `01-project-understanding.md` responde qué problema se resuelve, para quién, cuál es el
  resultado, qué entra, qué no entra y cuáles son las fronteras y riesgos.
- `03-story-map.md` responde cómo transcurre el recorrido, quién actúa en cada paso, qué
  responde el sistema y cómo cambian los caminos alternos, fallidos y de recuperación.
- `02-rules-and-questions.md` conserva la definición autoritativa de `BR-*` y `Q-*`.
- `04-release-slices.md` decide qué se entrega. El story map solo propone el primer
  resultado vertical y aporta el recorrido que permite decidirlo.

Referencia reglas e historias mediante enlaces e IDs; no las redefinas en `01` o `03`.

## `01-project-understanding.md`

Usa los encabezados en el idioma del paquete. Pueden variar literalmente, pero deben
conservar estos bloques semánticos con contenido real o una razón explícita de `No aplica`:

1. Resumen u objetivo en lenguaje simple.
2. Resultado esperado para la persona o el negocio.
3. Personas, actores y responsabilidades.
4. Alcance incluido.
5. Fuera de alcance.
6. Recorrido principal resumido.
7. Variaciones que cambian el comportamiento.
8. Caminos alternos, fallas y recuperación.
9. Riesgos materiales y decisiones pendientes, enlazadas a sus `Q-*` cuando existan.
10. Fuentes y documentos relacionados, incluido `02-rules-and-questions.md`.

Plantilla recomendada en español:

```markdown
## Objetivo
## Resultado esperado
## Personas y actores
## Alcance incluido
## Fuera de alcance
## Recorrido principal
## Variaciones
## Caminos alternos, fallas y recuperación
## Riesgos materiales y decisiones pendientes
## Fuentes y documentos relacionados
```

Describe fronteras entre sistemas solo cuando cambien autoridad, responsabilidad o el
resultado observable. Resume la conclusión de la evidencia técnica y enlázala; no copies
inventarios de clases, triggers, endpoints, campos o implementaciones extensas.

## `03-story-map.md`

Debe contener:

1. Persona o segmento, contexto y objetivo del recorrido.
2. Narrativa del progreso esperado.
3. Backbone ordenado de actividades principales.
4. Actividades con acciones de la persona, respuesta del sistema y resultado de salida.
5. Variaciones que cambian el camino o el resultado.
6. Caminos alternos, fallidos y de recuperación.
7. Primer resultado vertical candidato, sin convertirlo todavía en release aprobada.
8. Gaps o decisiones pendientes con responsable; usa `Ninguno` cuando se demostraron
   cerrados.
9. Enlaces relativos a `01-project-understanding.md` y `02-rules-and-questions.md`.

Plantilla recomendada en español:

```markdown
## Persona, contexto y objetivo
## Narrativa del recorrido
## Backbone
## Actividades, pasos y responsabilidades
## Variaciones del recorrido
## Caminos alternos, fallas y recuperación
## Primer resultado vertical candidato
## Gaps y responsables
## Enlaces
```

Separa visualmente responsabilidades de personas y sistemas. El backbone se lee de
principio a fin y cada actividad expresa avance observable, no nombres de componentes o
una lista de features.

## Consistencia cruzada

Antes de Gate 1, verifica que:

- los actores y términos conservan el mismo significado en ambos documentos;
- nada excluido aparece como actividad o resultado activo;
- el recorrido principal de `01` puede localizarse en el backbone de `03`;
- toda variación material aparece en ambos al nivel apropiado;
- preguntas abiertas siguen siendo preguntas y no afirmaciones;
- `03` conserva inicio, resultado y recuperación, sin depender de leer las historias;
- el detalle autoritativo se enlaza en vez de duplicarse.

Una persona nueva debe poder explicar, después de leer solo `01` y `03`: qué problema se
resuelve, para quién, qué está incluido, cómo avanza el recorrido y qué ocurre cuando algo
falla. Si no puede hacerlo, Gate 1 no está listo aunque existan ambos archivos.
