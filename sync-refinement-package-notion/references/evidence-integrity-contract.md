# Contrato de integridad de evidencias

Aplica a receipts, checkpoints, punteros, expedientes, payloads y candidatos.

- Calcular SHA-256 directamente de los bytes finales materializados; nunca copiar el hash
  de un receipt anterior después de editar un candidato.
- Conservar receipts y checkpoints anteriores byte a byte. Crear una nueva versión que
  declare `supersedes`, ruta, hash y motivo.
- Si los bytes de una alternativa rechazada no se conservaron, declarar su procedencia como
  no demostrable; no usar su hash para autorizar una operación.
- Materializar JSON y punteros mediante copia exacta y reemplazo atómico. No usar parches de
  texto que puedan cambiar la nueva línea final o el orden serializado.
- Antes y después de adoptar un delta, validar hashes de entradas, objetivos, consumidores,
  herramientas y evidencias preservadas.
- Un puntero vigente debe resolver a la ruta y SHA-256 exactos del checkpoint declarado.
- Los receipts remotos deben registrar identidad, payload objetivo, readback, modo de
  equivalencia, timestamp, intentos, rollback y estado neto.

Para crear evidencia inmutable o reemplazar un puntero sin normalizar bytes:

```bash
node scripts/materialize-local-evidence.mjs create \
  --candidate <candidato> --out <nuevo-receipt> --expected-sha256 <sha>
node scripts/materialize-local-evidence.mjs replace \
  --candidate <puntero-candidato> --out <puntero-vigente> \
  --expected-current-sha256 <sha-anterior> --expected-sha256 <sha-objetivo>
```
