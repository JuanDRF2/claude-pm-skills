# Contrato de experiencia de refinamiento

## Objetivo

Reducir saltos, memoria y comparación mental durante una reunión de refinamiento. Diseñar como documento de decisión, no como dashboard genérico.

Usar en todas las salidas los mismos nombres de componentes, jerarquía HTML y reglas visuales del generador estático. No crear una segunda versión aproximada para hosting: una diferencia de estructura produce estilos y comportamientos inconsistentes.

## Vista principal

Usar una lectura vertical:

1. Objetivo y alcance.
2. Reglas acordadas.
3. Criterios y pruebas relacionadas.
4. Pendientes y riesgos.

Cada criterio debe expandirse en este orden:

1. Definición `Dado/Cuando/Entonces`.
2. Reglas aplicables con definición completa.
3. Comprobaciones de cobertura expandibles.
4. Casos funcionales relacionados.
5. Escenarios de prueba relacionados.

No dividir un criterio en dos columnas de contenido equivalente. Las columnas son aceptables únicamente para metadatos cortos.

## Revelado progresivo

- Mostrar títulos, estado y conteos al cerrar un bloque.
- Abrir por defecto solo el primer criterio.
- Mantener detalles extensos colapsados.
- Evitar navegación a otra página para leer pruebas relacionadas.
- Ofrecer enlace profundo estable por proyecto, historia y sección.

## Lenguaje

No mostrar siglas solas. Usar patrones como:

- `Criterio de aceptación · AC-PBL-03-03`
- `Regla de negocio · BR-50`
- `Comprobación de cobertura · CHK-PBL-015`
- `Caso funcional · FTC-PBL-03`
- `Escenario de prueba · SC-PBL-03-04`

Conservar códigos porque conectan Markdown, Jira y QA.

## Vistas secundarias

### Plan de pruebas

Presentar todos los casos y escenarios para planificar ejecución, evidencia y automatización. Explicar que es una vista transversal para QA.

### Pendientes y riesgos

Presentar solo asuntos que requieren atención. Si no existen, decirlo explícitamente.

## Accesibilidad y respuesta

- Contraste AA como mínimo.
- Foco visible para botones, enlaces y elementos `summary`.
- Controles con nombres accesibles.
- Navegación utilizable con teclado.
- Áreas táctiles suficientes.
- Una columna de lectura en pantallas pequeñas.
- Tablas dentro de contenedores con desplazamiento, nunca rompiendo el layout.

## Estados vacíos

Mostrar advertencias accionables, no espacios en blanco:

- “Este criterio no tiene comprobaciones de cobertura.”
- “Esta comprobación requiere un escenario de prueba.”
- “No se identificaron pendientes específicos para esta historia.”
