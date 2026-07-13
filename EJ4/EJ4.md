# 📓 Bitácora de Prompts — Ejercicio N.º 4

## Datos

- **Alumnos:** Matias Brasburg y Tobias Rohr
- **Ejercicio:** N.º 4 — Validaciones y códigos de error
- **Fecha:** 13/07/2026
- **Modelo de IA usado:** ChatGPT / Codex

---

## 1. 🎯 Qué me pidieron

El ejercicio pedía validar los datos antes de que llegaran al repository, unificar la conversión del id de la URL y usar códigos de error consistentes. También había que evitar que los mensajes de PostgreSQL llegaran al cliente y, como existe la tabla `calificaciones`, validar nota, claves foráneas y duplicados.

---

## 2. 💬 Mis prompts (en orden)

### Prompt #1 — Auditoría

**Lo que escribí:**

```text
Actuá como desarrollador backend senior especializado en Node.js, Express y
PostgreSQL. Auditá alumnos-controller.js, alumnos-service.js y
alumnos-repository.js. Hacé una tabla con todos los datos que puede enviar el
cliente y explicá qué ocurre si vienen vacíos, con tipo incorrecto, demasiado
largos o con un id inválido.

No escribas código todavía. También revisá cursos, materias y la tabla
calificaciones. Indicá dónde hoy se puede devolver un 500, 404 o 201
incorrecto y si se filtra información interna de PostgreSQL.
```

**Auto-chequeo de las 5 partes EFSI:**

- [x] Rol
- [x] Contexto
- [x] Tarea
- [x] Restricciones
- [x] Iteración

**Qué me devolvió (resumen):**

La IA detectó que un alumno vacío llegaba al repository, donde los operadores `??` lo convertían en strings vacíos o cero. También encontró que GET y DELETE usaban ids como string, PUT usaba `parseInt`, y un id como `abc` terminaba en PostgreSQL. Los `catch` devolvían mensajes crudos y `DbPg` ocultaba errores, haciendo que algunas fallas de base parecieran 404 o 400.

Para calificaciones detectó que la tabla existía pero no había endpoints ni validaciones para nota, relaciones o duplicados.

### Prompt #2 — Diseño del patrón

**Lo que escribí:**

```text
Proponé un patrón consistente para este proyecto educativo sin agregar zod,
joi ni express-validator. Compará middleware, validación en controller y
funciones reutilizables llamadas desde el service.

Necesito que parsearId se use igual en GET, PUT y DELETE. Definí cómo
distinguir 400 por input, 404 por entidad inexistente, 409 por duplicado y 500
por error inesperado. Los detalles internos de la base no deben enviarse al
cliente.
```

**Por qué necesité este segundo prompt:**

La auditoría mostraba los problemas, pero faltaba decidir dónde resolverlos. Se eligió un helper para reglas de formato reutilizables y services para reglas que necesitan consultar otras entidades.

**Qué me devolvió (resumen):**

La IA propuso `validaciones-helper.js` para ids, tipos, textos y fechas; clases de error controlado con status; y un `responderError` que solo muestra mensajes de errores conocidos. La existencia de curso, alumno o materia queda en services porque necesita repositories. No se agregan dependencias.

### Prompt #3 — Implementación

**Lo que escribí:**

```text
Implementá el patrón elegido. Un alumno nuevo debe tener nombre y apellido no
vacíos de hasta 75 caracteres, id_curso entero positivo, fecha_nacimiento
YYYY-MM-DD real y no futura, y hace_deportes booleano. Los PUT pueden ser
parciales, pero deben traer al menos un campo editable.

Validá nombres de cursos y materias. Usá parsearId en GET/:id, PUT/:id y
DELETE/:id de todas las entidades. Un id inválido debe devolver 400.

Creá el CRUD de calificaciones sobre la tabla existente. La nota debe ser un
entero de 0 a 10, alumno y materia deben existir y la combinación no puede
repetirse: devolvé 409. Conservá SQL parametrizado, DbPg y ES modules. No
muestres errores de PostgreSQL ni agregues paquetes.
```

**Qué me devolvió (resumen):**

Se crearon los helpers de errores y validaciones, se actualizó el helper de respuestas y se aplicó `parsearId` en doce endpoints. Los services validan antes de escribir. También se agregaron repository, service y controller de calificaciones y se registró `/api/calificaciones` en `server.js`.

### Prompt #4 — Verificación

**Lo que escribí:**

```text
Verificá sintaxis e imports. Probá por HTTP ids con abc, bodies vacíos,
id_curso incorrecto, fechas inválidas, nota 99 y nota "diez". Confirmá que
los errores inesperados respondan solamente "Error interno.".

Para calificaciones hacé un ciclo que cree un registro, intente duplicarlo,
lo consulte, actualice, pruebe una FK inexistente, lo borre y confirme el 404.
Eliminá los datos de prueba al terminar.
```

**Qué me devolvió (resumen):**

Las pruebas unitarias e integradas pasaron. El ciclo de calificaciones obtuvo, en orden, 201, 409, 200, 200, 400, 200 y 404. El registro creado fue eliminado. También se confirmó que los mensajes internos se reemplazan por `Error interno.`.

---

## 3. 🔧 Qué hizo la IA y qué hice yo

| Archivo / función | Lo generó la IA | Lo revisé o decidí yo | Por qué |
|---|---|---|---|
| `validaciones-helper.js` | Implementó `parsearId` y validaciones de entidades. | Definí campos obligatorios, rangos, tipos y PUT parcial. | Las reglas debían ser explícitas y defendibles. |
| `errores-helper.js` | Creó errores controlados 400 y 409. | Revisé que solo esos errores expongan su mensaje. | Para no filtrar detalles de la base. |
| `respuestas-helper.js` | Agregó respuesta 409 y manejo seguro de errores. | Probé error controlado e inesperado con un `res` simulado. | El 500 siempre debe ser genérico para el cliente. |
| Controllers y services existentes | Unificó ids y validación previa al repository. | Comparé GET, POST, PUT y DELETE de las tres entidades. | Para que el patrón fuera consistente. |
| CRUD de calificaciones | Generó repository, service, controller y ruta. | Verifiqué nota, FKs, duplicado y limpieza del dato de prueba. | Es el caso que ejercita 400, 404, 409 y 500. |
| `db-pg.js` | Hizo que los errores se registren y se relancen. | Confirmé que el cliente no recibe el error crudo. | Antes una falla podía convertirse silenciosamente en null o cero. |

---

## 4. 🐛 Errores o cosas mal que detecté en la respuesta de la IA

La primera propuesta sugería usar `parseInt`. No se aceptó porque `parseInt('12abc')` devuelve 12 y deja pasar un id inválido. `parsearId` primero exige que todo el texto represente un entero positivo y recién después lo convierte.

Otra propuesta era validar todo en el controller. Eso duplicaba las reglas entre POST y PUT y no servía si el service era llamado desde otro lugar. Las validaciones reutilizables quedaron en un helper y las reglas con acceso a datos en los services.

También fue necesario cambiar `DbPg`: antes registraba el error y devolvía null o cero. Eso podía transformar una caída de base en 404 o 400. Ahora registra y relanza; el controller responde 500 sin incluir nombres de tablas, columnas ni queries.

---

## 5. ✅ Verificación

- [x] `POST /api/alumnos` con `{}` devuelve 400.
- [x] `GET /api/alumnos/abc` devuelve 400 en vez de 500.
- [x] `parsearId` rechaza `abc`, `1.5`, `0`, negativos y vacío.
- [x] GET, PUT y DELETE de alumnos, cursos, materias y calificaciones usan el mismo helper.
- [x] Nombre y apellido vacíos o con más de 75 caracteres devuelven 400.
- [x] `id_curso` no numérico, fecha imposible o futura y boolean incorrecto devuelven 400.
- [x] Cursos y materias aplican el mismo patrón de nombre obligatorio.
- [x] Nota 99 y nota `"diez"` devuelven 400.
- [x] Alumno o materia inexistentes en una calificación devuelven 400.
- [x] Una calificación repetida devuelve 409.
- [x] Calificaciones responde 201 al crear, 200 al consultar/actualizar/borrar y 404 después de borrar.
- [x] Un error no controlado devuelve `Error interno.` y no el mensaje de PostgreSQL.
- [x] Todos los archivos modificados pasan `node --check`.
- [x] No se agregaron dependencias ni se modificó `package.json`.

---

## 6. ✍️ Reflexión

Antes de este ejercicio, la API confiaba demasiado en los datos recibidos. Por ejemplo, un POST de alumnos con `{}` llegaba al repository y los valores faltantes se convertían en strings vacíos, cero o null. Dependiendo de la base, podía insertar información incorrecta o generar un error difícil de interpretar. Ahora ese mismo body se detiene en el service y devuelve 400 con un mensaje que indica el primer campo obligatorio faltante.

Elegimos separar dos tipos de reglas. Las validaciones de formato, como comprobar si un id es entero positivo, si un texto está vacío o si una nota está entre 0 y 10, viven en `validaciones-helper.js`. Son reutilizables y no necesitan conocer Express ni PostgreSQL. En cambio, comprobar si existe un curso, alumno o materia queda en los services, porque es una regla de negocio que necesita consultar otra entidad. De esta manera el controller se ocupa del protocolo HTTP, el service de las reglas y el repository solamente del acceso a datos.

La unificación de ids resolvió una inconsistencia importante. Antes, PUT usaba `parseInt`, mientras GET y DELETE enviaban el string directamente a PostgreSQL. Además, `parseInt` acepta parcialmente valores como `12abc`. El nuevo `parsearId` valida primero el texto completo, exige un entero positivo seguro y devuelve un número. Por eso `GET /api/alumnos/abc` ahora es claramente un 400: la request es inválida, no una entidad inexistente.

Otro cambio importante fue distinguir errores controlados de errores inesperados. Los errores de validación pueden mostrar mensajes útiles porque fueron escritos para el cliente. Los errores de PostgreSQL se registran internamente, pero el cliente solo recibe `Error interno.` con status 500. También corregimos `DbPg`, que antes ocultaba excepciones devolviendo null o cero y podía producir un 404 o 400 engañoso.

Calificaciones permitió aplicar todos los casos juntos. La nota debe ser entera entre 0 y 10, ambas claves foráneas deben existir y la combinación alumno-materia es única. Elegimos 409 para el duplicado porque el body es válido, pero entra en conflicto con el estado actual. La prueba completa creó una calificación, obtuvo 409 al repetirla, la actualizó y finalmente la borró. Esto demostró que la validación no solo rechaza inputs malos, sino que mantiene funcionando los casos correctos.

---

## 7. 🔗 Adjuntos

- [ ] Link o PDF de la conversación completa con la IA
- [x] Commit con la implementación: `a52dc1b` (`hecho el 2 casi el 3`)
- [ ] La carpeta `EJ4` queda pendiente de agregar a un nuevo commit
- [x] Guía de pruebas: `EJ4/PRUEBAS-POSTMAN.md`
- [x] Evidencia automática de status 200, 201, 400, 404 y 409
