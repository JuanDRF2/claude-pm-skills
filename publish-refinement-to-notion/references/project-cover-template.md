# Plantilla editorial de portada

Usar esta estructura para toda página principal de refinamiento en Notion. Conservar exactamente el orden y los títulos. El contenido cambia por proyecto; la arquitectura de lectura no.

## Reglas de uso

- Usar un icono de dominio en el título de la página; no codificar un icono universal.
- Usar `green_bg` para Aprobada, `yellow_bg` para Aprobada con observaciones o Borrador no aprobado, y `red_bg` para Bloqueada.
- Mostrar primero el estado y la autoridad documental, antes de cualquier detalle.
- Conservar las diez secciones aunque alguna no aplique. Usar `No aplica — [decisión de alcance]` solo cuando el entregable no corresponda; usar `No generado — [artefacto canónico ausente]` cuando falte su fuente.
- No crear secciones paralelas que dupliquen Estado, Alcance, Pendientes o Material de refinamiento.
- Resumir en la portada. Mantener el detalle completo en historias o páginas auxiliares enlazadas.
- Agrupar más de diez historias por slice, outcome o área funcional. Nunca publicar una lista plana extensa.
- Mostrar historias activas, diferidas y retiradas en grupos separados.
- No afirmar `Ready for Sprint` basándose solo en aprobación de Producto.

## Estructura obligatoria

```markdown
<callout icon="[icono de estado]" color="[green_bg | yellow_bg | red_bg]">
	**Estado de la publicación:** [Aprobada | Aprobada con observaciones | Borrador no aprobado | Bloqueada].
	**Fuente canónica:** [fuente, fecha o snapshot].
	[Restricción o excepción humana cuando aplique.]
</callout>

## 1. Objetivo

[Actor, resultado buscado, problema que resuelve y límite principal en un párrafo breve.]

## 2. Estado y readiness

- **Producto:** [estado y fecha].
- **Ingeniería:** [estado].
- **QA:** [estado].
- **Design:** [estado o No aplica].
- **Listo para Sprint:** [Sí | No | Parcial], porque [evidencia].
- **Bloqueo principal:** [ID, owner e impacto, o Ninguno].

## 3. Refinement Judge

- **Veredicto:** [PASS | PASS WITH OBSERVATIONS | FAIL | No ejecutado].
- **Fecha y snapshot:** [fecha y SHA-256, o razón verificable].
- **Hallazgos abiertos:** [IDs y títulos breves, o Ninguno].
- **Acciones permitidas:** [resumen].
- **Acciones bloqueadas:** [resumen].
- **Excepción humana:** [responsable, fecha y alcance, o Ninguna].

## 4. Inventario

- **Historias:** [total; activas, diferidas y retiradas].
- **Criterios de aceptación:** [total y distribución relevante].
- **Escenarios canónicos:** [total].
- **Comprobaciones de cobertura:** [total].
- **Casos funcionales:** [total].
- **Automatización:** [Automate now, Automate later, Manual y Blocked].

## 5. Alcance

### Incluido

- [capacidad o resultado].

### Excluido

- [exclusión explícita].

### Diferido

- [ID, razón y condición de reactivación, o No aplica].

## 6. Decisiones críticas

- **[ID o tema]:** [decisión que cambia implementación o pruebas].

Incluir solo decisiones transversales de alto impacto. No copiar todo el catálogo de reglas.

## 7. Índice de historias

### [Slice, outcome o área 1]

- [US-ID — título](URL_DE_NOTION)
- [US-ID — título](URL_DE_NOTION)

### Historias diferidas

- [US-ID — título y razón](url)

### Historias retiradas

- [US-ID — título, razón y reemplazo](url)

Omitir solamente los grupos sin elementos; conservar la sección `Índice de historias`.

## 8. Pendientes y riesgos

### Pendientes principales

- **[Q-ID — pregunta]:** Owner: [rol]. Bloquea: [Sí/No]. Impacto: [resultado].

### Riesgos principales

- **[riesgo]:** [consecuencia y control existente].

Mostrar como máximo diez elementos combinados. Enlazar la página detallada cuando existan más.

## 9. Paquete Markdown y materiales

- [Reglas, decisiones y preguntas](url)
- [Plan funcional de pruebas](url)
- [Matriz de cobertura y automatización](url)
- [Pendientes, riesgos y preparación](url)
- [Handoff DEV](url)
- [Handoff QA](url)
- [Abrir Paquete Markdown nativo](url)
- **Baseline verificado:** [hash]
- **Snapshot del manifiesto:** [hash]
- [Historial de sincronización](url)

La vista colaborativa conserva los seis materiales habituales y ofrece acceso al paquete
nativo 1:1 y a su auditoría. El manifiesto y baseline conectan esas páginas con el checkout
Markdown. Cuando el equipo confirme un destino de desarrollo externo, mostrar la línea
compacta de destino dentro de esta sección reemplazando el enlace genérico por
`- **Destino de desarrollo:** <nombre> — [Handoff DEV](url)`. Conservar todo el mapping en
`Handoff DEV`. Si no está confirmado, mantener el enlace genérico; no escribir `No aplica`
ni crear una sección adicional.

## 10. Próximo paso

[Una acción concreta, su owner y la condición observable para avanzar al siguiente gate.]

<details>
<summary>Subpáginas internas del proyecto</summary>

### Historias

<page url="URL_DE_NOTION">US-ID — título</page>

### Material de refinamiento

<page url="URL_DE_NOTION">Reglas, decisiones y preguntas</page>
<page url="URL_DE_NOTION">Plan funcional de pruebas</page>
<page url="URL_DE_NOTION">Matriz de cobertura y automatización</page>
<page url="URL_DE_NOTION">Pendientes, riesgos y preparación</page>
<page url="URL_DE_NOTION">Handoff DEV</page>
<page url="URL_DE_NOTION">Handoff QA</page>

### Paquete y operación

<page url="URL_DE_NOTION">Paquete Markdown</page>
<page url="URL_DE_NOTION">Historial de sincronización</page>

</details>
```

## Regla técnica del índice

- Escribir cada historia en una sola línea: `- [US-ID — título](URL_DE_NOTION)`.
- No dejar líneas vacías entre historias consecutivas del mismo grupo.
- No escribir un guion vacío seguido por un bloque `<page>`. El patrón siguiente está prohibido porque crea un elemento de lista vacío y espacios verticales:

```markdown
-
  <page url="...">US-ID — título</page>
```

- Mantener todos los bloques `<page>` dentro del único desplegable `Subpáginas internas del proyecto`, después de la sección 10. No usarlos como hijos de una lista ni dejarlos sueltos al final.
- Después de publicar, confirmar que cada enlace abre la subpágina correcta y que ninguna historia aparece duplicada.

## Regla del contenedor de subpáginas

- El desplegable existe para preservar la relación padre-hijo en Notion; no es navegación primaria.
- Mantenerlo cerrado por defecto y después de `## 10. Próximo paso`.
- Incluir una sola vez cada subpágina real.
- Agrupar historias, material y operación con subtítulos humanos.
- `Paquete Markdown` e `Historial de sincronización` deben aparecer una sola vez bajo
  `Paquete y operación`; nunca bajo `Material de refinamiento`.
- Las secciones 7 y 9 conservan los enlaces visibles. El contenedor no debe aparecer como una segunda lista editorial.
- No mostrar bloques `<page>` fuera de este contenedor.

## Control de densidad

- Objetivo: máximo dos párrafos.
- Estado y Judge: hechos cortos, no narrativas.
- Decisiones críticas: máximo diez; enlazar el catálogo completo.
- Pendientes y riesgos: máximo diez elementos combinados.
- Material de refinamiento: enlaces con nombres humanos, no rutas ni siglas solas.
- Destino de desarrollo: una sola línea en la sección 9 cuando esté confirmado; el detalle
  permanece en `Handoff DEV`.
- Índice: agrupar siempre; ordenar según el story map o release slices canónicos.
- Índice: una línea por historia, sin guiones vacíos ni separación entre elementos consecutivos.

## Compatibilidad de estado

- Con `PASS`, usar `Aprobada` si los owners requeridos también aprobaron.
- Con `PASS WITH OBSERVATIONS`, usar `Aprobada con observaciones` y mostrar las observaciones.
- Con `FAIL`, usar `Bloqueada`; solo usar `Borrador no aprobado` cuando exista una excepción humana registrada para publicar esa vista.
- Sin Judge, usar `No ejecutado` y no presentar la página como gate final aprobado.
