# Ejercicio 6 - Bitacora y entrega de arquitectura

## Datos

- **Alumno:** tobi
- **Ejercicio:** 6 - Arquitectura de la aplicacion
- **Fecha:** 03/08/2026
- **Proyecto:** API Node.js + Express + PostgreSQL
- **Modelo usado:** ChatGPT / Codex

---

## 1. Que habia que hacer

El ejercicio pedia usar la IA como consultor de arquitectura, no como generador masivo de codigo. Tenia que revisar el flujo controller -> service -> repository -> DbPg, detectar decisiones discutibles, explicar impactos y trade-offs, y aplicar una mejora chica pero justificada.

La mejora elegida fue compartir el `Pool` de PostgreSQL desde `DbPg`, porque era un problema real: si cada repository tiene su propia instancia de `DbPg`, tambien puede terminar teniendo su propio pool de conexiones.

---

## 2. Prompts usados

### Prompt 1

**Lo que pedi:**

```text
Actua como arquitecto back-end experto en Node.js. Estoy trabajando sobre una API Express con capas controller, service, repository y DbPg. Quiero que revises la arquitectura criticamente, asumiendo que hay al menos 3 decisiones discutibles. No me des codigo todavia: dame problemas reales, impacto y trade-offs.
```

**EFSI:**

- [x] Rol
- [x] Contexto
- [x] Tarea
- [x] Restricciones
- [x] Iteracion

**Respuesta resumida:**

```text
La IA marco como puntos principales el service pass-through, el manejo de errores de DbPg, la cantidad de pools de conexion, el poco uso de entities y los console.log repartidos por capas.
```

**Que hice con eso:**

```text
Compare esos puntos contra el codigo real. Descarte hacer una refactorizacion grande y elegi una mejora concreta: compartir el Pool de PostgreSQL.
```

### Prompt 2

**Lo que pedi:**

```text
De esas recomendaciones, elegi una sola para implementar en este proyecto educativo. Tiene que aportar valor real, tocar pocos archivos y no meter Clean Architecture, DDD, contenedores de inyeccion de dependencias ni patrones grandes. Justifica por que esa mejora es proporcional.
```

**EFSI:**

- [x] Rol
- [x] Contexto
- [x] Tarea
- [x] Restricciones
- [x] Iteracion

**Respuesta resumida:**

```text
La IA recomendo compartir el Pool dentro de DbPg usando una propiedad estatica o una instancia a nivel de modulo. La ventaja era mantener la misma interfaz para los repositories y reducir el consumo de conexiones.
```

**Que hice con eso:**

```text
Use la idea de compartir el Pool, pero mantuve la creacion lazy para que el pool se cree recien cuando llega la primera query.
```

### Prompt 3

**Lo que pedi:**

```text
Ahora armame el documento de entrega del ejercicio 6. Tiene que explicar el flujo real de una request, listar 3 a 5 problemas de arquitectura, incluir recomendacion y trade-off para cada uno, y aclarar cual fue el cambio implementado.
```

**EFSI:**

- [x] Rol
- [x] Contexto
- [x] Tarea
- [x] Restricciones
- [x] Iteracion

**Respuesta resumida:**

```text
La IA propuso un documento con flujo, problemas, recomendaciones, trade-offs y verificacion.
```

**Que hice con eso:**

```text
Lo adapte al estado real del proyecto, especialmente porque DbPg ya propaga errores con throw error. No deje ese punto como si siguiera roto.
```

---

## 3. Cambios hechos en el proyecto

| Archivo | Cambio | Motivo |
|---|---|---|
| `src/repositories/db-pg.js` | Se cambio el pool por `static sharedPool` | Evitar un pool por repository. |
| `prompting/entregas/06-analisis-arquitectura.md` | Se agrego el analisis arquitectonico pedido | Es el entregable principal del ejercicio. |
| `EJ6/EJ6.md` | Se agrego esta bitacora separada | Deja mi version de la entrega documentada. |

---

## 4. Decision tecnica principal

```text
La decision fue compartir el Pool de PostgreSQL dentro de DbPg.

No cambie los repositories ni los controllers porque la interfaz de DbPg ya servia. El cambio queda encapsulado: los repositories siguen llamando queryAll, queryOne, queryReturnId y queryRowCount.

El trade-off es que ahora toda la app usa un unico pool compartido. Para este proyecto es correcto, porque hay una sola base y una sola configuracion. Si el proyecto necesitara multiples bases o multiples perfiles de conexion, habria que redisenarlo.
```

---

## 5. Problemas detectados

```text
1. Cada repository podia terminar con su propio Pool.
   Recomendacion: compartir el Pool desde DbPg.

2. Algunos services parecen pass-through.
   Recomendacion: mantenerlos por consistencia, pero ubicar ahi las reglas reales.

3. Los errores de base no deben confundirse con registros no encontrados.
   Recomendacion: propagar errores despues de loguearlos.

4. Hay console.log de debug repartidos.
   Recomendacion: migrarlos gradualmente a un logger/helper con niveles.

5. Entities existe pero se usa poco.
   Recomendacion: no forzar su uso, pero aprovecharlo para objetos creados desde codigo o tests.
```

---

## 6. Verificacion

Checklist del ejercicio:

```text
[x] El documento describe el flujo real de una request.
[x] Cada problema detectado existe en el codigo o en una decision real del proyecto.
[x] Cada recomendacion tiene trade-off.
[x] El cambio implementado no cambia los endpoints.
[x] No se agrego sobre-ingenieria.
```

Prueba tecnica realizada:

```text
Se verifico la sintaxis de los archivos JS con node --check.
Resultado obtenido: sin errores de sintaxis.
```

Limitacion:

```text
Las pruebas HTTP completas dependen de tener PostgreSQL levantado con las tablas cargadas. El cambio toca solamente la administracion del Pool, no el contrato HTTP.
```

---

## 7. Reflexion

```text
Este ejercicio fue distinto a los anteriores porque no se trataba de agregar endpoints ni de copiar codigo nuevo. La consigna pedia mirar la arquitectura y justificar decisiones. Eso obliga a revisar si una recomendacion realmente mejora este proyecto o si solamente suena profesional.

El primer punto que revise fue la capa service. Es verdad que algunos metodos parecen pass-through, sobre todo cuando solo llaman al repository. Pero no me parece correcto eliminar la capa completa. En alumnos ya se usa para agregar edad y validar curso existente, y en calificaciones se usa para validar referencias y evitar duplicados. Entonces el problema no es que exista service, sino que hay que cuidar que las reglas nuevas vivan ahi y no en controllers.

La recomendacion que elegi implementar fue compartir el Pool de PostgreSQL. Me parecio la mas proporcional porque resuelve un problema concreto sin cambiar el diseno general. Antes, si cada repository creaba su propia instancia de DbPg, podia haber varios pools. Con cuatro entidades tal vez no se nota demasiado, pero al crecer el proyecto puede generar muchas conexiones innecesarias contra la base. Cambiarlo dentro de DbPg mantiene igual la interfaz para todos los repositories.

Tambien revise el manejo de errores. El enunciado marcaba que DbPg podia tragarse errores, pero en el codigo actual ya aparece throw error despues de loguear. Por eso no escribi el documento como si ese problema siguiera igual. Esa fue una correccion importante sobre lo que podria haber respondido la IA de forma generica.

Lo que aprendi es que una mejora de arquitectura no siempre es agregar mas capas o patrones. En este caso, una propiedad estatica en DbPg alcanza para mejorar el manejo de conexiones. Para defenderlo, la clave es explicar el trade-off: se gana control y simplicidad, pero se asume que la aplicacion usa una sola configuracion de base. Para este TP esa suposicion es razonable.
```

---

## 8. Adjuntos

- [ ] Conversacion completa con IA: pendiente de exportar.
- [ ] Commit en GitHub: pendiente.
- [ ] Capturas / evidencias: pendiente.
