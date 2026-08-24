---
name: sync-refinement-package-notion
description: Sincroniza opcionalmente el Markdown canónico de GitHub con páginas nativas derivadas de Notion de forma incremental y segura. Usar para registrar o actualizar una vista, importar ediciones remotas como propuestas, reconciliar concurrencia o recuperar una publicación interrumpida sin convertir Notion en fuente de verdad.
---

# Sync Refinement Package Notion

> **Nota de mantenimiento:** el autor de esta librería no usa Notion en su propio trabajo y
> no valida este skill contra un workspace de Notion real. Su motor (scripts en `scripts/`)
> sí tiene cobertura de pruebas local extensa, pero enteramente contra fixtures simuladas —
> nunca contra Notion real. Revísalo a fondo antes de confiar en él para un flujo de equipo
> real.

Mantener un Markdown local por artefacto y una página nativa de Notion por Markdown. El
commit mergeado de la rama canónica de GitHub conserva la fuente documental compartida;
Notion ofrece una vista colaborativa derivada. La sincronización opera sobre esas páginas
sin promover ediciones remotas directamente al canon.

## Contratos obligatorios

Leer completamente:

- [references/native-pages-fast-contract.md](references/native-pages-fast-contract.md) para
  cualquier operación normal;
- [references/page-manifest-contract.md](references/page-manifest-contract.md) al registrar
  identidades;
- [references/publication-authorization-contract.md](references/publication-authorization-contract.md)
  y [references/publication-execution-contract.md](references/publication-execution-contract.md)
  antes de una escritura;
- [references/notion-presentation-validation-contract.md](references/notion-presentation-validation-contract.md)
  cuando cambien portada, historias o materiales editoriales.

Leer [references/legacy-recovery-contract.md](references/legacy-recovery-contract.md) solo
para terminar o cerrar una ejecución antigua que ya tenga un dossier, ledger o checkpoint
activo. No imponer ese costo a una actualización nueva.

## Operaciones

- `register`: registrar proyecto, jerarquía e IDs estables.
- `start`: capturar todas las páginas registradas cuando no existe baseline confiable. Si
  GitHub ya está registrado, el contenido remoto se importa como propuesta de
  reconciliación y no reemplaza el checkout canónico.
- `status`: comparar hashes locales y detectar el cambio candidato sin consultar Notion.
- `plan`: demostrar el cierre de impacto y congelar páginas `update`, `verification-only`,
  `preserve` y `blocked`.
- `publish`: leer y escribir únicamente el alcance afectado aprobado.
- `reconcile`: resolver cambios locales y remotos sobre una misma página mediante base,
  local y remoto.
- `recover`: continuar solo páginas pendientes de una ejecución interrumpida.
- `full-audit`: releer todo el manifiesto únicamente por solicitud explícita, baseline
  inicial, evidencia obsoleta o señal real de drift global.

Inferir la operación. No preguntar al usuario por nombres internos si el contexto permite
resolverlos.

## Flujo normal rápido

1. Confirmar repositorio, rama y commit canónico fuente; validar localmente el paquete
   completo y su grafo de trazabilidad.
   Conservar el `package_kind` del manifiesto: `shared-contract` usa su contrato reducido
   explícito y `shared-contract-cover`; un proyecto usa la validación y portada completas.
2. Comparar el checkout con el baseline y derivar todos los consumidores afectados.
3. Exigir que cada cambio local esté seleccionado o excluido con razón. Una diferencia
   histórica no entra silenciosamente al write set.
4. Leer desde Notion solo las páginas seleccionadas y sus presentaciones afectadas.
5. Comparar cada una contra su base:
   - remoto igual a base: puede actualizarse;
   - remoto ya equivalente al target: `verification-only`, sin escritura;
   - remoto distinto de base y target: conflicto localizado; detener esa página y sus
     dependientes;
   - página fuera del alcance: no leer, no escribir y no afirmar que fue verificada.
6. Ejecutar Judge `Publication` sobre el paquete validado y el plan de impacto.
7. Mostrar un único expediente con digest, páginas exactas, estrategia, preservadas,
   bloqueadas, backups, readback y auditoría condicionada. Pedir autorización externa.
8. Justo antes de cada escritura, releer esa página o comprobar metadata estable. Si cambió,
   invalidar solo la operación dependiente antes de sobrescribirla.
9. Respaldar y escribir la página. Probar primero una canary cuando cambien serializador,
   transporte, plantilla o tipo estructural; no por cada actualización ordinaria.
10. Hacer un readback completo por página escrita. Un segundo readback se permite solo por
    respuesta incompleta, transporte ambiguo o normalización previamente documentada.
11. Verificar primero igualdad exacta y después equivalencia Markdown conservadora. Nunca
    ignorar cambios en texto, IDs, destinos, celdas, código, dinero, fechas, estados o
    Gherkin.
12. Ejecutar Judge `Post-publication`, actualizar el baseline únicamente para páginas
    verificadas y crear una auditoría idempotente. No promover páginas bloqueadas.

Usar `scripts/fast-sync.mjs` para `capture`, `plan`, `preflight` y `verify`. El contrato
detallado contiene ejemplos de entrada y salida.

## Colaboración y concurrencia

Notion puede recibir ediciones humanas. La seguridad no depende de descargar todo el
proyecto: depende de releer cada página afectada antes de modificarla y compararla con su
base. Una edición material remota se captura como propuesta y se lleva primero a una rama
GitHub para decisión, validación y merge; solo después puede publicarse nuevamente como
derivado. Una edición remota en otra página no se sobrescribe: quedará para la próxima
operación que la afecte o para `full-audit`.

Reportar el alcance con precisión:

- `localized-verified`: todas las páginas del cambio fueron leídas y verificadas;
- `globally-audited`: todo el manifiesto fue releído en esta ejecución;
- nunca usar `fully-aligned` después de una revisión localizada.

## Seguridad de escritura

- Publicar por `notion_page_id`, no por título.
- Nunca hacer `replace` de portada o página con subpáginas/bloques no administrados; usar un
  patch con ancla única y simulación exacta.
- Entregar payloads como datos leídos desde archivo, no mediante interpolación de shell.
- Una respuesta HTTP exitosa no prueba publicación.
- No ampliar comparadores durante una ejecución. Corregirlos en una versión separada con
  regresiones y retomar después.
- No releer páginas preservadas salvo que una dependencia, una señal de drift o el usuario
  lo exija.
- No crear auditoría hasta completar readback, paridad y Judge posterior.

## Compatibilidad

Los proyectos existentes con páginas nativas pueden adoptar `native-pages-fast-v1` sin
republicar: registrar su manifiesto, commit GitHub fuente y baseline una vez. Una ejecución
antigua interrumpida se cierra con su evidencia congelada y luego adopta el modelo vigente.

## Resultado

Reportar operación, proyecto, alcance verificado, páginas escritas, `verification-only`,
preservadas y bloqueadas, modo de equivalencia, respaldos, Judge, auditoría y siguiente
paso. Incluir el commit GitHub fuente e indicar claramente si la evidencia es localizada o
global.
