# Portada de contrato compartido

Usar únicamente cuando el manifiesto declare `package_kind: shared-contract`.

## Resumen visible

Abrir con un callout que muestre, sin siglas internas:

- Estado
- Propietario
- Consumidores
- Regla de cambio

Después mostrar Proyecto, Estado, Última actualización y Aprobado hasta.

## Secciones obligatorias

Usar exactamente este orden:

1. Autoridad y alcance
2. Comportamiento aprobado
3. Decisiones todavía abiertas
4. Paquetes consumidores
5. Gobierno de cambios
6. Material técnico
7. Operación y auditoría

`Paquetes consumidores` incluye una tabla con el impacto mínimo por consumidor. `Material
técnico` enlaza la página nativa del paquete Markdown. `Operación y auditoría` enlaza el
historial de sincronización.

No añadir las diez secciones de una portada de proyecto, historias humanas, cobertura o
handoffs que no pertenezcan al manifiesto. No abreviar el contrato canónico: la portada debe
ser autosuficiente para comprender autoridad, comportamiento, pendientes e impacto.

Validar el payload y el readback con `type: shared-contract-cover`.
