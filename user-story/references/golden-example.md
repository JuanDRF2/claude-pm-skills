# Ejemplo canónico — Historia, criterios y escenarios

Usar este ejemplo cuando se necesite comprobar la forma completa vigente. Los ejemplos
breves de otras referencias explican conceptos o errores; este archivo es la referencia
estructural autoritativa.

## Contenido

- Qué demuestra
- Historia de usuario
- Criterios y escenarios canónicos
- Cobertura de QA derivada
- Regla de lectura final

## Qué demuestra

- La historia y el comportamiento se entienden sin conocer la arquitectura.
- Cada criterio declara una condición de aceptación y posee escenarios estables.
- Éxito, rechazo y resultado asíncrono tienen acciones o resultados distintos y, por eso,
  permanecen en escenarios separados.
- Los valores concretos tienen una fuente aprobada o se identifican como datos de prueba,
  nunca como una regla inventada.
- La validación de mensajes distingue significado y texto exacto.
- QA agrega ejecutabilidad y evidencia sin reescribir el comportamiento de Producto.

## Historia de usuario

### US-MEM-01 — Comprar una membresía individual en línea

#### Estado, alcance y preparación

- **Resumen:** Comprar una membresía individual sin asistencia del personal.
- **Estado de aprobación:** Product confirmed
- **Evaluación de tamaño:** Suitable — entrega un resultado de compra único.
- **Estado de backlog:** Approved
- **Ready for Sprint:** No — falta revisión de Engineering y QA.
- **Preparación por rol:** Product: Approved; Engineering: Pending; QA: Pending.

#### Historia

**Como** visitante que compra una membresía para sí mismo  
**quiero** completar la compra en línea  
**para** comenzar a usar los beneficios de la membresía sin asistencia del personal.

#### Alcance

- **Incluye:** cobro de una membresía individual, activación, rechazo del pago y confirmación.
- **No incluye:** membresías familiares, regalos, renovaciones ni cambios posteriores.

#### Comportamiento acordado

- El total mostrado antes de confirmar es el total que se intenta cobrar. (`BR-MEM-01`)
- La membresía queda activa solamente cuando el cobro queda confirmado. (`BR-MEM-02`)
- Si el cobro es rechazado, no se registra dinero recibido ni se activa una membresía. (`BR-MEM-03`)
- La confirmación llega al correo del comprador dentro de cinco minutos. (`BR-MEM-04`)

#### Dependencias y preguntas

- **Fuente de reglas:** `BR-MEM-01`–`BR-MEM-04`, confirmadas por Producto.
- **Dependencias:** proveedor de pagos y servicio de correo disponibles en el ambiente QA.
- **Supuestos:** ninguno convertido en comportamiento.
- **Preguntas abiertas:** ninguna para estos criterios.
- **Configuración:** el precio pertenece a la configuración del programa; el ejemplo usa un
  programa configurado en USD 100 y no establece un precio general del producto.

#### Criterios de aceptación

##### AC-MEM-01-01 — Activar la membresía después del cobro

**Reglas:** `BR-MEM-01`, `BR-MEM-02`

**Condición de aceptación:** Cuando el cobro del total mostrado queda confirmado, debe
registrarse ese pago y debe quedar activa una única membresía para el comprador.

###### SC-MEM-01-01 — Completar una compra con cobro confirmado

**Dado:** que el comprador seleccionó una membresía individual configurada en USD 100  
**Y:** que completó la información requerida para comprarla para sí mismo  
**Cuando:** confirma la compra y el banco informa que los USD 100 fueron cobrados  
**Entonces:** se registra un único pago por USD 100  
**Y:** queda activa una única membresía individual para el comprador  
**Y:** la confirmación en pantalla muestra que la compra terminó y presenta el total pagado.

**Datos de prueba:** `DATA-MEM-01`; USD 100 es un valor representativo de un programa
configurado, no una nueva regla de precio.

**Consideración técnica:** La evidencia interna puede identificar el cobro como `captured`;
ese término no reemplaza el resultado de negocio anterior.

**Estrategia QA:**

- **Ejecutabilidad:** Ready
- **Ejemplo controlado:** programa individual de USD 100 y comprador sin membresía activa.
- **Estado inicial:** no existe pago ni membresía para esta solicitud.
- **Resultado controlado:** el proveedor confirma un único cobro de USD 100.
- **Evidencia observable:** confirmación en pantalla, pago por USD 100 y membresía activa.
- **Automatización:** Automate now
- **Nivel recomendado:** Integration
- **Prioridad:** High
- **Razón:** protege la consistencia entre dinero recibido y membresía creada.
- **Dependencias:** respuesta controlada del proveedor y consulta autorizada del estado final.
- **Estado:** Not started

##### AC-MEM-01-02 — Conservar el estado anterior cuando el cobro es rechazado

**Reglas:** `BR-MEM-03`

**Condición de aceptación:** Un cobro rechazado debe dejar claro que la compra no terminó,
sin registrar dinero recibido ni activar una membresía.

###### SC-MEM-01-02 — Recibir el rechazo del cobro

**Dado:** que el comprador completó la información de una membresía individual de USD 100  
**Y:** que no existe un pago ni una membresía activa para esta solicitud  
**Cuando:** confirma la compra y el banco rechaza el cobro  
**Entonces:** se informa que el pago no pudo completarse y que puede intentar otro medio  
**Y:** no se registra dinero recibido  
**Y:** no se crea ni activa una membresía.

**Validación del mensaje:** validar el significado y la acción disponible; no exigir texto
literal porque Producto no aprobó una redacción exacta.

**Estrategia QA:**

- **Ejecutabilidad:** Ready
- **Ejemplo controlado:** programa de USD 100 y respuesta de rechazo controlada.
- **Estado inicial:** no existe pago ni membresía para esta solicitud.
- **Resultado controlado:** el proveedor rechaza el cobro sin registrar dinero recibido.
- **Evidencia observable:** aviso de rechazo y ausencia de pago y membresía.
- **Automatización:** Automate now
- **Nivel recomendado:** Integration
- **Prioridad:** High
- **Razón:** evita que un pago fallido deje beneficios o dinero registrados.
- **Dependencias:** respuesta de rechazo controlada y consulta del estado final.
- **Estado:** Not started

##### AC-MEM-01-03 — Enviar la confirmación de la compra

**Reglas:** `BR-MEM-04`

**Condición de aceptación:** Después de una compra completada, el comprador debe recibir
una confirmación con la membresía y el total pagado dentro del tiempo acordado.

###### SC-MEM-01-03 — Recibir la confirmación por correo

**Dado:** que la compra terminó con una membresía activa y un pago de USD 100  
**Cuando:** el sistema procesa la confirmación de la compra  
**Entonces:** el correo del comprador recibe la confirmación dentro de cinco minutos  
**Y:** la confirmación identifica la membresía y el total pagado  
**Y:** la membresía permanece activa mientras se entrega el correo.

**Observación asíncrona:** la llegada del correo o el registro autorizado de entrega es la
señal final; si no existe ninguna señal después de cinco minutos, el escenario falla.

**Validación del mensaje:** validar membresía, total y propósito; el resto de la redacción
puede cambiar porque no existe copy literal aprobado.

**Estrategia QA:**

- **Ejecutabilidad:** Ready
- **Ejemplo controlado:** compra completada por USD 100 y buzón controlado.
- **Estado inicial:** membresía activa, pago registrado y correo aún no entregado.
- **Resultado controlado:** el servicio acepta y entrega una única confirmación.
- **Evidencia observable:** correo o registro autorizado de entrega dentro de cinco minutos.
- **Automatización:** Automate later
- **Nivel recomendado:** Integration
- **Prioridad:** Medium
- **Razón:** el resultado es importante, pero depende de infraestructura de correo estable.
- **Dependencias:** buzón controlado y señal confiable de entrega.
- **Estado:** Not started

## Cobertura de QA derivada

### Checks atómicos

| Check | Criterio | Qué debe demostrarse |
|---|---|---|
| `CHK-MEM-001` | `AC-MEM-01-01` | Registrar una vez el total efectivamente cobrado. |
| `CHK-MEM-002` | `AC-MEM-01-01` | Activar una única membresía para el comprador. |
| `CHK-MEM-003` | `AC-MEM-01-02` | No registrar dinero ni membresía ante rechazo. |
| `CHK-MEM-004` | `AC-MEM-01-03` | Entregar la confirmación dentro del tiempo acordado. |
| `CHK-MEM-005` | `AC-MEM-01-03` | Conservar activa la membresía mientras llega el correo. |

### FTC-MEM-01 — Completar una compra individual

- **Historias:** `US-MEM-01`
- **Propósito:** verificar los resultados principales de compra, rechazo y confirmación.
- **Prioridad/Riesgo:** High
- **Nivel recomendado:** Integration
- **Recomendación de automatización:** reutilizar la estrategia de cada `SC-*`.
- **Estado de revisión de QA:** Draft
- **Ejecutabilidad:** Ready para `SC-MEM-01-01` y `SC-MEM-01-02`; la automatización de
  `SC-MEM-01-03` depende de la infraestructura de correo.

#### Precondiciones

- Programa individual disponible y comprador controlado.
- Proveedor de pagos con respuestas confirmada y rechazada controlables.

#### Datos y ambiente

- `DATA-MEM-01`: programa configurado en USD 100 y comprador sin membresía activa.
- Buzón de QA con hora observable para la confirmación.

#### Escenarios reutilizados

| Escenario canónico | Checks cubiertos | Evidencia principal |
|---|---|---|
| `SC-MEM-01-01` | `CHK-MEM-001`, `CHK-MEM-002` | Pago, membresía y confirmación en pantalla. |
| `SC-MEM-01-02` | `CHK-MEM-003` | Rechazo y ausencia de cambios de negocio. |
| `SC-MEM-01-03` | `CHK-MEM-004`, `CHK-MEM-005` | Entrega de correo y membresía aún activa. |

El caso funcional enlaza o reproduce literalmente los escenarios anteriores; no crea una
segunda versión de su Given/When/Then.

## Regla de lectura final

Ocultar mentalmente IDs, datos y consideraciones técnicas. Si una persona todavía puede
explicar quién compra, qué sucede y qué resultado espera, el comportamiento está escrito en
lenguaje de producto. Después, mostrar datos y evidencia para que QA pueda ejecutarlo sin
inventar decisiones.
