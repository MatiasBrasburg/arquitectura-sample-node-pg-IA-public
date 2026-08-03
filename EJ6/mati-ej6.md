mati:

# Ejercicio 6 - Bitacora y analisis de arquitectura

## Datos

- **Alumno:** Mati
- **Ejercicio:** 6 - Arquitectura de la aplicacion
- **Fecha:** 03/08/2026
- **Modelo usado:** ChatGPT / Codex

---

## 1. Que me pidieron

El ejercicio pide usar la IA como consultor de arquitectura, no como generador de codigo masivo. Habia que mirar el proyecto en capas, detectar decisiones discutibles, explicar impactos y trade-offs, y despues implementar una sola recomendacion acotada.

La parte importante era no caer en sobre-ingenieria. El proyecto es una API educativa con Express y PostgreSQL, entonces no tenia sentido meter DDD, CQRS o un contenedor de inyeccion de dependencias solo para "hacer arquitectura".

---

## 2. Prompts inventados usados

### Prompt 1

**Lo que escribi:**

```text
Actua como arquitecto de software senior revisando una API educativa de Node.js, Express y PostgreSQL. Te paso que el proyecto usa capas controller -> service -> repository -> DbPg. Quiero un analisis critico, no complaciente, sobre si las capas tienen sentido y que problemas reales ves. No me propongas Clean Architecture ni patrones grandes: dame problemas concretos de este proyecto y sus trade-offs.
```

**EFSI:**

- [x] Rol
- [x] Contexto
- [x] Tarea
- [x] Restricciones
- [x] Iteracion

**Que me devolvio, resumen:**

```text
La IA marco varios puntos: algunos services son pass-through, DbPg podia crear mas de un Pool, habia console.log repartidos, entities casi no se usaba y habia que revisar el manejo de errores. Tambien recomendo no sobredisenar el proyecto.
```

**Que hice con eso:**

```text
Tome los puntos que existian realmente en el codigo y descarte recomendaciones demasiado grandes.
```

### Prompt 2

**Lo que escribi:**

```text
De esos problemas, elegi uno solo para implementar en este repo. Tiene que ser un cambio chico, defendible en un oral y que no cambie la forma en que los controllers o repositories llaman a la base. Explicame que gano y que pierdo.
```

**EFSI:**

- [x] Rol
- [x] Contexto
- [x] Tarea
- [x] Restricciones
- [x] Iteracion

**Que me devolvio, resumen:**

```text
La IA recomendo compartir el Pool de PostgreSQL dentro de DbPg usando una propiedad estatica. Asi cada repository podia seguir haciendo new DbPg(), pero todas las instancias usarian el mismo Pool.
```

**Que hice con eso:**

```text
Me parecio la mejor opcion porque arregla un problema real mencionado en el enunciado y no obliga a tocar todos los repositories.
```

### Prompt 3

**Lo que escribi:**

```text
Revisa la solucion de Pool compartido. Quiero que me digas si es sobre-ingenieria para este proyecto, si rompe algo de la arquitectura actual y que deberia verificar despues de tocar DbPg.
```

**EFSI:**

- [x] Rol
- [x] Contexto
- [x] Tarea
- [x] Restricciones
- [x] Iteracion

**Que me devolvio, resumen:**

```text
La IA dijo que no era sobre-ingenieria porque el cambio queda encapsulado en DbPg. Tambien aclaro que habia que verificar que los metodos queryAll, queryOne, queryReturnId y queryRowCount sigan con la misma interfaz, y correr node --check.
```

**Que hice con eso:**

```text
Implemente el cambio solamente en db-pg.js y no modifique los repositories. Despues verifique sintaxis.
```

---

## 3. Que hizo la IA y que hice yo

| Archivo / parte | Lo genero la IA | Lo modifique yo | Por que |
|---|---:|---:|---|
| `src/repositories/db-pg.js` | Si | Si | Se implemento un Pool compartido con `DbPg.sharedPool`. |
| `prompting/entregas/06-analisis-arquitectura.md` | Si | Si | Documento requerido por el ejercicio con flujo, problemas, recomendaciones y trade-offs. |
| `EJ6/mati-ej6.md` | Si | Si | Bitacora separada para Mati con prompts inventados acordes. |

Comentario agregado en codigo:

```text
// [IA] Recomendacion elegida: compartir el Pool entre todos los repositories.
// [YO] Lo mantuve lazy para no abrir conexiones antes de la primera query.
```

---

## 4. Analisis de arquitectura

### Flujo de una request

```text
Cliente
  -> server.js
  -> controller
  -> service
  -> repository
  -> DbPg
  -> PostgreSQL
```

Ejemplo con alumnos:

```text
GET /api/alumnos/5
  -> AlumnosController toma el id
  -> AlumnosService busca el alumno y agrega edad
  -> AlumnosRepository arma el SQL
  -> DbPg ejecuta queryOne
  -> PostgreSQL devuelve la fila
  -> el controller responde 200 o 404
```

---

## 5. Problemas detectados y recomendaciones

### Problema 1: varios pools de PostgreSQL

Antes cada repository podia terminar con su propia instancia de `DbPg` y su propio Pool.

**Impacto:** mas consumo de conexiones y menos control si crecen las entidades.

**Recomendacion:** compartir el Pool dentro de `DbPg`.

**Trade-off:** se gana eficiencia y control; se pierde flexibilidad si alguna vez distintos repositories necesitaran bases distintas.

**Estado:** implementado.

### Problema 2: services que casi no agregan logica

`CursosService` delega mucho al repository. `AlumnosService` si agrega valor porque calcula edad y valida curso.

**Impacto:** puede parecer una capa extra sin sentido.

**Recomendacion:** mantenerla por consistencia y porque es el lugar correcto para futuras reglas.

**Trade-off:** se gana orden; se pierde simplicidad inmediata.

### Problema 3: muchos `console.log`

Hay logs en controllers, services, repositories y constructores.

**Impacto:** ensucia la consola y no permite controlar nivel ni destino.

**Recomendacion:** moverlos gradualmente a `LogHelper` o quitar los que sean ruido.

**Trade-off:** se gana prolijidad; se pierde debug rapido con console directo.

### Problema 4: entities poco usadas

Las clases de `entities/` existen, pero el flujo normal usa `req.body`.

**Impacto:** puede confundir porque parece una capa importante pero se usa poco.

**Recomendacion:** no forzarlas. Usarlas cuando se creen objetos desde codigo o tests.

**Trade-off:** se gana simplicidad; se pierde estructura mas formal.

### Problema 5: manejo de errores repetido en controllers

`DbPg` ya relanza errores y los controllers usan `responderError`, pero sigue habiendo `try/catch` repetido.

**Impacto:** hay boilerplate repetido.

**Recomendacion:** no tocarlo ahora. Un wrapper async podria ayudar, pero seria otro refactor mas grande.

**Trade-off:** se mantiene el estilo del proyecto; se pierde centralizacion total.

---

## 6. Cambio implementado

Se cambio `DbPg` para que el Pool sea compartido:

```text
DbPg.sharedPool = null
```

Ahora `getDBPool()` hace esto:

```text
Si sharedPool no existe, lo crea.
Si ya existe, lo reutiliza.
```

No se tocaron los repositories porque siguen usando la misma interfaz:

```text
this.db.queryAll(...)
this.db.queryOne(...)
this.db.queryReturnId(...)
this.db.queryRowCount(...)
```

---

## 7. Verificacion

Checklist del ejercicio:

```text
[x] El documento describe el flujo real de una request.
[x] Los problemas detectados existen en el codigo.
[x] Cada recomendacion tiene trade-off.
[x] Se implemento una recomendacion acotada.
[x] No se metio sobre-ingenieria.
[x] El cambio no altera la interfaz de los repositories.
[x] node --check paso en los archivos JS.
```

Comando usado:

```powershell
Get-ChildItem -Recurse -Filter *.js src | ForEach-Object { node --check $_.FullName }
```

Resultado:

```text
OK - sin errores de sintaxis.
```

Limitacion:

```text
No se hizo prueba completa contra PostgreSQL porque depende de tener la base local levantada. El cambio esta encapsulado en DbPg y no modifica rutas ni SQL.
```

---

## 8. Reflexion

```text
En este ejercicio la parte mas importante fue no pedirle a la IA que reescriba todo. El objetivo era usarla como consultor de arquitectura y despues decidir que recomendacion aplicar. La arquitectura actual del proyecto tiene sentido para una API educativa: controller para HTTP, service para reglas, repository para SQL y DbPg para encapsular PostgreSQL.

El primer problema que mire fue la capa service. En cursos parece una capa que no hace demasiado, porque muchos metodos solo delegan al repository. Sin embargo, en alumnos si se ve el valor porque calcula edad y valida que el curso exista. Por eso no me parecio correcto borrar services. Aunque hoy algunos sean simples, mantienen una estructura consistente y dejan un lugar claro para reglas futuras.

La recomendacion que decidi implementar fue compartir el Pool de PostgreSQL. Antes cada instancia de DbPg podia tener su propio Pool, y como cada repository crea su DbPg, el proyecto podia terminar con varios pools. En una app chica no explota enseguida, pero es una mala tendencia: consume mas conexiones y hace menos predecible el uso de recursos. La solucion fue chica: usar una propiedad estatica `DbPg.sharedPool`. Asi no hizo falta tocar controllers, services ni repositories.

Tambien detecte otros puntos discutibles, como los console.log repartidos y las entities casi sin uso. No los implemente porque el ejercicio pide una recomendacion acotada, no una limpieza general. Cambiar logs o reformar entities podia convertirse en un refactor mas grande sin aportar tanto como el Pool compartido.

Para mi, lo mas defendible del cambio es que resuelve un problema concreto mencionado en el enunciado y mantiene la arquitectura existente. No agrega frameworks, no cambia la forma de llamar a la base y no obliga a aprender un patron nuevo. El trade-off es que se asume una sola configuracion de base para toda la app, pero eso coincide con el proyecto actual.
```

---

## 9. Adjuntos

- [ ] Conversacion completa con IA: pendiente de exportar.
- [ ] Commit en GitHub: pendiente.
- [ ] Capturas o evidencia adicional: pendiente.
