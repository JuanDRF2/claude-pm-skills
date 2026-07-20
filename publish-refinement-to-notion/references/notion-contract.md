# Contrato de publicación en Notion

## Estructura del proyecto

```text
Proyecto de refinamiento
├── Resumen, alcance y estado
├── Índice de historias
├── US-... — Historia 1
├── US-... — Historia 2
├── Plan funcional de pruebas
└── Pendientes y riesgos
```

Para una sola historia o prototipo, usar una página única.

## Página de historia

La página debe ser autosuficiente y revisable como futuro ticket Jira. Un revisor no debe necesitar abrir el paquete Markdown, otra subpágina ni un enlace local para comprender o aprobar la historia. Los enlaces al paquete canónico son trazabilidad adicional, no sustitutos del contenido.

1. Estado y preparación en metadatos cortos.
2. Historia completa en formato Como/Quiero/Para dentro de un callout.
3. Alcance, exclusiones, decisiones, dependencias, supuestos y valor esperado con su texto completo.
4. Criterios desplegables con uno o más escenarios canónicos `SC-*`.
5. Dentro de cada criterio:
   - definición Given/When/Then;
   - reglas aplicables con ID y definición completa, no solo referencias;
   - checks con ID, objetivo, riesgo, nivel, evidencia y estado;
   - escenarios relacionados con pasos/resultados completos y recomendación de automatización.
6. Caso funcional consolidado con precondiciones y datos. El `FTC-*` agrupa por referencia los mismos `SC-*`; no introduce escenarios alternativos ni duplica su comportamiento.
7. Resumen de trazabilidad compacto.
8. Pendientes y riesgos específicos de la historia.

## Regla de contenido completo

- No publicar frases como “consultar el Markdown canónico”, “se conserva en el paquete” o listas de IDs como reemplazo del comportamiento.
- No resumir un criterio, regla, check o escenario si el paquete contiene su definición completa.
- No publicar escenarios con varias acciones distintas comprimidas en un solo `Cuando`, ni resultados no relacionados unidos con punto y coma, flechas, signos `+`, `/` o `=`.
- Preferir lenguaje de producto. Mover nombres de objetos internos, integraciones, eventos, claves y logs a una sección técnica después del resultado observable.
- Conservar explícitamente estado de Producto, Engineering, QA, Design y `Listo para Sprint` cuando existan.
- Marcar historias diferidas o retiradas con su razón, decisiones preservadas y condición de reactivación.
- Si el tamaño obliga a dividir llamadas a Notion, dividir la escritura técnica, no la experiencia final: toda la información debe terminar dentro de la misma subpágina de historia.

## Experiencia

- Abrir por defecto solo la información esencial; usar toggles para detalle.
- No usar columnas para criterios ni comportamiento. Columnas solo para metadatos cortos.
- Evitar tablas largas; usar una tabla únicamente para trazabilidad resumida.
- No mostrar siglas solas: `Comprobación de cobertura · CHK-PBL-001`.
- Mantener escenarios dentro de la página de la historia; no obligar a navegar a otra página para comprender un criterio.
- Preservar idioma, estados y relaciones explícitas de los Markdown.

## Verificación

Después de publicar, comprobar:

- número de historias y criterios;
- número y texto completo de criterios, checks y escenarios relacionados;
- títulos de subpáginas;
- funcionamiento de desplegables y tablas;
- ausencia de decisiones inventadas;
- privacidad y ubicación correctas.
- ausencia de placeholders o referencias que obliguen a abandonar Notion para revisar el ticket.
