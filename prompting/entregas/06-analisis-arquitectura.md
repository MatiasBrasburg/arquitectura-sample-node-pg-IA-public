# Ejercicio 06 - Analisis de arquitectura

## Flujo actual de una request

Ejemplo: `GET /api/alumnos/5`

```text
Cliente / Postman
  -> server.js
  -> AlumnosController
  -> AlumnosService
  -> AlumnosRepository
  -> DbPg
  -> PostgreSQL
  -> DbPg
  -> AlumnosRepository
  -> AlumnosService
  -> AlumnosController
  -> respuesta HTTP
```

El controller recibe `req` y `res`, parsea el `id`, llama al service y decide la respuesta HTTP. El service concentra reglas de negocio, por ejemplo agregar edad a un alumno o validar que exista el curso. El repository conoce SQL y tablas. `DbPg` concentra el uso de `pg`, el `Pool`, el `try/catch`, el log y la extraccion de `rows`.

## Problemas o decisiones discutibles

### 1. Un Pool por instancia de repository

**Problema:** antes cada `DbPg` guardaba su propio `this.DBPool`. Como cada repository crea su instancia, la aplicacion podia terminar con varios pools de PostgreSQL.

**Impacto:** con pocas entidades casi no se nota, pero al crecer el proyecto aumenta la cantidad de conexiones y se complica controlar el consumo contra la base.

**Recomendacion:** compartir un unico `Pool` desde `DbPg`.

**Trade-off:** se gana control de conexiones y menor consumo. Se pierde un poco de flexibilidad si en el futuro se quisieran pools separados por modulo o por base, aunque hoy no hace falta.

### 2. Services que a veces parecen pass-through

**Problema:** algunos services solo llaman al repository y devuelven lo mismo. Eso puede parecer una capa innecesaria.

**Impacto:** hay mas archivos para navegar y mas codigo repetitivo.

**Recomendacion:** mantener la capa service, pero exigir que las reglas nuevas entren ahi y no en controllers. En este proyecto ya aporta en `AlumnosService` y `CalificacionesService`.

**Trade-off:** se paga algo de boilerplate, pero se conserva una arquitectura consistente y facil de defender cuando aparecen reglas de negocio.

### 3. Errores de base confundidos con "no encontrado"

**Problema:** el enunciado marcaba que `DbPg` podia tragarse errores y devolver `null` o `0`. En el estado actual del codigo ya se mejoro porque los metodos hacen `throw error` despues de loguear.

**Impacto:** si se tragaran los errores, el controller podria responder 404 o 400 cuando en realidad se cayo la base.

**Recomendacion:** mantener la propagacion de errores y que `responderError` sea quien traduzca el problema a HTTP.

**Trade-off:** se ven mas errores reales en la capa superior, pero se evitan respuestas falsas.

### 4. `console.log` repartidos por todas las capas

**Problema:** hay logs de debug en controllers, services y repositories.

**Impacto:** en desarrollo ayudan, pero en produccion ensucian la salida y no tienen niveles ni formato.

**Recomendacion:** migrar gradualmente esos logs a `LogHelper` o a un logger con niveles.

**Trade-off:** se gana trazabilidad ordenada, pero requiere tocar muchos archivos y no es el cambio de mayor valor para este ejercicio.

### 5. `entities/` se usa poco

**Problema:** las entidades existen, pero la mayoria de endpoints trabajan directamente con `req.body`.

**Impacto:** queda poco claro si las entidades son parte real del dominio o solo ejemplos.

**Recomendacion:** usarlas cuando se creen objetos desde codigo o tests, pero no forzar su uso en todos los endpoints mientras el proyecto siga siendo simple.

**Trade-off:** se evita sobre-ingenieria, aunque se pierde algo de estructura fuerte en los datos.

## Cambio implementado

Implemente la recomendacion de compartir el `Pool` en `src/repositories/db-pg.js`.

Antes, cada instancia de `DbPg` podia tener su propio pool. Ahora `DbPg` usa una propiedad estatica:

```js
static sharedPool = null;
```

Y `getDBPool()` crea el pool solo una vez:

```js
if (DbPg.sharedPool == null) {
    DbPg.sharedPool = new Pool(config);
}
return DbPg.sharedPool;
```

La interfaz publica de `DbPg` no cambio. Los repositories siguen usando `this.db.queryAll`, `queryOne`, `queryReturnId` y `queryRowCount`, por lo tanto el cambio queda acotado a una sola clase.

## Verificacion

- [x] El flujo de request esta descripto contra archivos reales del proyecto.
- [x] Los problemas detectados existen en el codigo actual o en la decision marcada por el enunciado.
- [x] Cada recomendacion incluye trade-off.
- [x] El cambio implementado es acotado y no modifica endpoints.
- [x] No se agrego un patron grande innecesario.

## Decision para defender en el oral

No estoy de acuerdo con eliminar la capa service solo porque algunos metodos sean pass-through. En este proyecto la capa ya tiene valor en alumnos y calificaciones. Sacarla haria que las proximas reglas terminen en controllers o repositories, que son lugares peores para sostener reglas de negocio.
