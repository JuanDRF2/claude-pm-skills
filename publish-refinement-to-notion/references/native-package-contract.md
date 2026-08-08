# Contrato del paquete nativo de Notion

## Modos

### Publicación completa

Es el modo predeterminado cuando el usuario pide publicar, republicar o generar el refinamiento sin limitar la acción a páginas concretas. Crear o actualizar:

1. Bajo la página padre elegida, la página colaborativa canónica del proyecto: portada,
   historias y seis páginas auxiliares.
2. Como hijo directo y único de esa página, el contenedor técnico `Subpáginas internas
   del proyecto`.
3. Dentro de ese contenedor, `Paquete Markdown` y `Historial de sincronización` como hijos
   directos, únicos y hermanos.
4. Dentro de `Paquete Markdown`, una página nativa por cada Markdown incluido.
5. Dentro de ese contenedor, páginas que preserven directorios como `jira/` y `handoffs/`.

Jerarquía obligatoria:

```text
destino elegido/
└── proyecto canónico/
    ├── historias y materiales editoriales/
    └── Subpáginas internas del proyecto/
        ├── Paquete Markdown/
        │   ├── documentos numerados
        │   ├── jira/
        │   └── handoffs/
        └── Historial de sincronización/
            └── eventos verificados append-only
```

No crear `Paquete Markdown` como hermano del proyecto ni publicar Markdown directamente
en el destino general. No crear el historial dentro de `Paquete Markdown`, dentro de una
página de material ajena al contenedor técnico ni en el destino general. Adoptar la página
canónica y los contenedores existentes antes de crear. Si un proyecto registrado ya tiene
paquete e historial como hijos directos de la raíz, conservar esa modalidad compatible;
no mover páginas únicamente para uniformar la presentación.

La portada enlaza `Historial de sincronización` inmediatamente después de `Paquete
Markdown` en la sección 9. Su bloque de subpágina vive bajo `Operación y auditoría` en el
desplegable final, separado de `Material de refinamiento`.

### Actualización localizada

Usarla cuando el usuario nombra historias, secciones o páginas concretas. Actualizar solo ese alcance y cualquier conteo, estado, enlace o resumen de portada cuya verdad haya cambiado. Preservar las demás páginas y registrar qué quedó fuera del alcance.

No convertir automáticamente una corrección puntual en una republicación completa.

Aplicar `editorial-update-contract.md`: decidir cada presentación por responsabilidad
documental. No actualizar todos los materiales por defecto ni duplicar una decisión para
probar propagación. Preservar una página solo cuando el plan de impacto demuestre que su
contenido final sigue completo, correcto y no contradictorio.

## Roles del paquete

- `canonical`: documentos numerados que contienen estado, decisiones, reglas, mapa,
  slices, historias maestras, cobertura, casos, trazabilidad, índice, matrices aplicables
  y Judge.
- `derived`: `jira/*.md`, `handoffs/*.md` y toda la vista colaborativa.
- `operational`: manifiestos, snapshots, respaldos y receipts; no publicar como contenido.

No omitir un Markdown incluido por considerarlo redundante. Publicar las vistas derivadas,
marcarlas en el manifiesto y regenerarlas desde las unidades canónicas.

## Vista colaborativa obligatoria

Mantener la estructura ya usada por el equipo:

- portada con las diez secciones;
- una página autosuficiente por historia;
- Reglas, decisiones y preguntas;
- Plan funcional de pruebas;
- Matriz de cobertura y automatización;
- Pendientes, riesgos y preparación;
- Handoff DEV;
- Handoff QA.

Esta es la interfaz humana principal. Es derivada del paquete canónico y se actualiza junto
con el espejo; no se elimina ni se reemplaza por páginas con nombres de archivo.

## Ausencias legítimas

`No aplica` significa que el entregable no corresponde al alcance por una decisión explícita. `No generado` significa que falta el artefacto canónico requerido y debe indicar cuál falta.

La inexistencia previa de una página en Notion no es una razón válida para usar ninguno de esos estados. En una publicación completa, si existe el artefacto canónico aplicable, la página se crea.

## Identidad y duplicados

Antes de crear, buscar por destino, relación padre-hijo, manifiesto y título canónico.
Actualizar la página ya registrada o enlazada desde la portada. No crear variantes como
`Título (1)`, `Título nuevo` o `Título — fecha`.

Si existen duplicados:

1. conservar como canónica la página enlazada desde la portada o la que tenga identidad registrada en el manifiesto;
2. no borrar ni fusionar contenido ajeno sin autorización;
3. registrar los duplicados como observación y corregir los enlaces de navegación.

## Manifiesto y verificación

## Paquetes compartidos

Antes de publicar `artifacts/_shared/<slug>/`, leer su propietario:

- Con `owner_project`, crear o adoptar una página visible del contrato dentro de la página
  canónica del proyecto propietario. Crear bajo ella el contenedor técnico y, dentro, un
  único `Paquete Markdown` y un único `Historial de sincronización` como hermanos; registrar el paquete
  compartido con manifiesto independiente.
- Sin proyecto propietario, exigir un hub compartido confirmado por el usuario.

No mezclar las unidades del contrato con el manifiesto del refinamiento principal. La
página visible explica propietario, alcance, consumidores, estado y regla de impacto; el
espejo 1:1 conserva el Markdown literal. Los consumidores enlazan la página visible, no un
catálogo general de reglas ni una copia local publicada por separado.

Registrar por página: tipo, título, URL, acción (`Creada`, `Actualizada`, `Preservada` o `No generada`), fuente canónica y snapshot.

En una publicación completa, volver a leer todas las páginas. Confirmar:

- destino → proyecto → contenedor interno → `Paquete Markdown` como cadena padre-hijo, o
  la modalidad heredada destino → proyecto → `Paquete Markdown`;
- `Historial de sincronización` y `Paquete Markdown` comparten padre;
- una página por Markdown incluido;
- rutas lógicas y roles correctos;
- títulos e IDs sin duplicados;
- misma versión del paquete;
- contenido canónico equivalente y vistas derivadas regenerables;
- enlaces relativos resueltos por el manifiesto.
