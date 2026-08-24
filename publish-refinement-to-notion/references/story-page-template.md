# Plantilla editorial de historia en Notion

Usar esta estructura para toda página colaborativa de historia. El Markdown canónico puede
tener otra jerarquía interna; esta presentación reorganiza sin resumir ni cambiar contenido.

```markdown
<callout icon="[estado]" color="[green_bg | yellow_bg | red_bg]">
	**Historia:** [US-ID — título].
	**Estado:** [estado de aprobación].
	**Listo para Sprint:** [Sí | No | Bloqueada — razón].
</callout>

## 1. Historia y valor

**Como** [persona]  
**quiero** [acción]  
**para** [resultado].

## 2. Estado y preparación

[Estado, tamaño, backlog y preparación por rol.]

## 3. Alcance

### Incluido

- [comportamiento]

### Excluido

- [comportamiento]

## 4. Comportamiento acordado

- **Regla de negocio · BR-ID — título:** [definición completa].

## 5. Dependencias, supuestos y preguntas

- **Dependencias:** [...]
- **Supuestos:** [...]
- **Preguntas abiertas:** [...]
- **Configuración:** [...]

## 6. Criterios de aceptación y cobertura QA

<details>
<summary>Criterio de aceptación · AC-ID — título humano</summary>

**Condición de aceptación:** [resultado observable].

### Reglas de negocio aplicables

- **Regla de negocio · BR-ID — título:** [definición completa].

<details>
<summary>Escenario canónico · SC-ID — título humano</summary>

**Dado:** [...]  
**Cuando:** [...]  
**Entonces:** [...]

**Estrategia QA:** [ejecutabilidad, automatización, nivel, prioridad, razón, dependencias y estado].
</details>

### Comprobaciones de cobertura

<details>
<summary>Comprobación de cobertura · CHK-ID — título humano</summary>

- **Objetivo:** [...]
- **Riesgo protegido:** [...]
- **Evidencia esperada:** [...]
- **Nivel y estado:** [...]
</details>

### Caso funcional relacionado

- **Caso funcional · FTC-ID — título humano:** [propósito y escenario relacionado].

</details>

## 7. Casos funcionales relacionados

<details>
<summary>Caso funcional · FTC-ID — título humano</summary>

[Propósito, precondiciones, datos, escenarios reutilizados, evidencia y estrategia.]
</details>

## 8. Pendientes, riesgos y calidad

- **Pendientes:** [...]
- **Riesgos:** [...]
- **Calidad relevante:** [...]

## 9. Trazabilidad y próximo paso

[Una única tabla compacta AC → BR → SC → CHK → FTC.]

- **Próximo paso:** [acción, owner y condición observable].
```

## Invariantes

- Cada criterio es un desplegable autosuficiente.
- Mostrar definiciones completas, no listas de IDs.
- El caso funcional completo aparece una sola vez en la sección 7; cada criterio muestra su
  relación sin duplicarlo.
- Una sola tabla compacta de trazabilidad. No repetir cobertura en tablas paralelas.
- Los detalles técnicos aparecen después del resultado de negocio.
- Omitir campos opcionales sin contenido; no dejar placeholders.
