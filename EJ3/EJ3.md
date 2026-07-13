# 📓 Bitácora de Prompts — Ejercicio N.º 3

## Datos

- **Alumnos:** Matias Brasburg y Tobias Rohr
- **Ejercicio:** N.º 3 — Extracción de código repetido a helpers
- **Fecha:** 13/07/2026
- **Modelo de IA usado:** ChatGPT / Codex

---

## 1. 🎯 Qué me pidieron

El ejercicio pedía detectar lógica repetida dentro de una misma capa y moverla a módulos reutilizables. Había que crear un helper para las respuestas HTTP de los controllers y otro para el cálculo de edad, sin cambiar status codes, cuerpos JSON, mensajes ni reglas de negocio.

---

## 2. 💬 Mis prompts (en orden)

### Prompt #1 — Diagnóstico

**Lo que escribí:**

```text
Actuá como desarrollador backend senior con experiencia en Node.js, Express
y arquitectura por capas. Revisá alumnos-controller.js,
cursos-controller.js, materias-controller.js y alumnos-service.js.

Sin escribir código todavía, detectá qué lógica se repite o está ubicada en
una capa incorrecta. Ordená los candidatos según cuánto código ahorrarían y
explicá qué conviene extraer a src/helpers. No cambies la API, los status
codes, el formato de las respuestas ni la edad calculada.
```

**Auto-chequeo de las 5 partes EFSI:**

- [x] Rol
- [x] Contexto
- [x] Tarea
- [x] Restricciones
- [x] Iteración

**Qué me devolvió (resumen):**

La IA identificó primero las llamadas repetidas a `res.status(...).json/send(...)` en los tres controllers. Como segundo candidato encontró `calcularEdad` y `agregarEdad`, que estaban dentro de `alumnos-service.js` aunque son utilidades de fechas reutilizables. También mencionó los `try/catch`, pero recomendó no extraerlos en esta etapa porque contienen decisiones propias de cada endpoint.

**¿Me sirvió tal cual, o tuve que corregir/repreguntar?**

Sirvió para limitar el ejercicio a los dos helpers pedidos. Decidimos mantener los `if`, los `try/catch` y los mensajes en los controllers para que siguiera siendo visible cuándo se elige cada respuesta.

### Prompt #2 — Helper de respuestas

**Lo que escribí:**

```text
Implementá solamente src/helpers/respuestas-helper.js usando ES modules.
Creá funciones con nombres claros para responder 200, 201, 400 con JSON,
400 con texto, 404 y 500. El helper debe ser independiente de alumnos,
cursos y materias.

Reemplazá en los tres controllers todas las llamadas directas a res.status,
pero conservá exactamente el status, el uso de json o send y el contenido
que devolvía cada endpoint. No cambies services, repositories ni rutas.
```

**Por qué necesité este segundo prompt:**

El diagnóstico solo indicaba qué extraer. Este prompt definió una implementación acotada y, especialmente, obligó a distinguir el error 400 enviado como JSON del enviado como texto para no cambiar respuestas existentes.

**Qué me devolvió (resumen):**

La IA creó seis funciones: `responderOk`, `responderCreado`, `responderBadRequestJson`, `responderBadRequestTexto`, `responderNotFound` y `responderErrorInterno`. Los tres controllers ahora las importan y ya no importan `StatusCodes` ni llaman directamente a `res.status`.

### Prompt #3 — Helper de fechas y verificación

**Lo que escribí:**

```text
Ahora creá src/helpers/fechas-helper.js y mové allí calcularEdad y
agregarEdad como funciones exportadas. AlumnosService debe importar
agregarEdad en lugar de definir ambas funciones internamente.

Conservá exactamente el algoritmo actual y no mutes el objeto alumno.
Después verificá sintaxis, imports, status codes 200/201/400/404/500 y que
GET de alumnos siga agregando una edad numérica. No agregues dependencias.
```

**Por qué necesité este tercer prompt:**

La consigna recomendaba implementar un helper por vez. Separarlo permitió revisar el cambio de respuestas antes de mover la lógica de fechas y facilitó detectar si algo se rompía.

**Qué me devolvió (resumen):**

La IA movió el algoritmo sin modificarlo, actualizó el import del service y verificó los helpers de forma aislada. Luego levantó temporalmente la API y obtuvo respuestas 200, 400 y 404 reales. `GET /api/alumnos/1` siguió incluyendo el campo `edad`.

---

## 3. 🔧 Qué hizo la IA y qué hice yo

| Archivo / función | Lo generó la IA | Lo revisé o decidí yo | Por qué |
|---|---|---|---|
| `src/helpers/respuestas-helper.js` | Creó las seis funciones de respuesta. | Verifiqué que cada función conservara status y `json`/`send`. | El cliente debe recibir exactamente el mismo contrato. |
| Controllers de alumnos, cursos y materias | Reemplazó las respuestas directas por imports y llamadas al helper. | Comparé cada rama con el código anterior. | Para no alterar mensajes ni casos de error. |
| `src/helpers/fechas-helper.js` | Extrajo `calcularEdad` y `agregarEdad`. | Decidí conservar el algoritmo y comprobé que no mutara el alumno. | El ejercicio es una extracción, no un cambio de reglas. |
| `src/services/alumnos-service.js` | Quitó las funciones locales e importó `agregarEdad`. | Verifiqué GET individual, GET de lista y entidad nula. | La edad debe seguir apareciendo igual que antes. |
| Pruebas | Propuso y ejecutó verificaciones automáticas. | Revisé los resultados y preparé la secuencia manual de Postman. | La validación final debe poder repetirse. |

---

## 4. 🐛 Errores o cosas mal que detecté en la respuesta de la IA

Una primera alternativa era crear una sola función genérica como `responder(res, status, contenido, tipo)`. La descartamos porque obligaba a repetir los status codes en todos los controllers y usar un parámetro para elegir entre JSON y texto. Las funciones con nombre son más explícitas y concentran esas decisiones.

También se evaluó extraer el `try/catch` entero a un wrapper asíncrono. No se hizo porque los POST y PUT responden 400 ante excepciones, mientras que varios GET y DELETE responden 500. Un wrapper único necesitaba demasiada configuración y ocultaba el flujo del endpoint.

Durante la prueba aislada, importar los controllers sin cargar `.env` produjo un error del `LogHelper`. Se corrigió la prueba cargando `dotenv/config`, igual que lo hace el arranque normal desde `server.js`; no fue necesario modificar la aplicación.

---

## 5. ✅ Verificación

- [x] Los dos helpers viven en `src/helpers/` y usan exports de ES modules.
- [x] Los controllers ya no importan `StatusCodes` ni llaman directamente a `res.status`.
- [x] El helper de respuestas fue probado de forma aislada para 200, 201, 400 JSON, 400 texto, 404 y 500.
- [x] Los seis archivos modificados pasan `node --check`.
- [x] Los tres controllers y sus dependencias se importan correctamente cargando el entorno de la aplicación.
- [x] `calcularEdad` y `agregarEdad` solo están definidos en `fechas-helper.js`.
- [x] `agregarEdad` devuelve una copia y no modifica el objeto recibido.
- [x] Prueba integrada: `GET /api/cursos` respondió 200.
- [x] Prueba integrada: `GET /api/materias` respondió 200.
- [x] Prueba integrada: `GET /api/alumnos/1` respondió 200 e incluyó `edad: 19`.
- [x] Los GET con id `999999` respondieron 404 en alumnos, cursos y materias.
- [x] `POST /api/materias` con nombre vacío y PUT con ids distintos respondieron 400.
- [x] No se agregaron dependencias ni se modificó `package.json`.

---

## 6. ✍️ Reflexión

En este ejercicio trabajamos sobre una duplicación distinta a la del ejercicio anterior. El ejercicio 2 centralizaba consultas que se repetían entre repositories; esta vez revisamos código repetido dentro de los controllers y una utilidad que estaba ubicada en el service de alumnos. El primer paso fue diagnosticar antes de modificar, porque no todo bloque parecido necesariamente debe convertirse en helper.

El caso más visible eran las respuestas de Express. Los controllers repetían muchas veces `res.status(...).json(...)` o `res.status(...).send(...)`. Creamos funciones con nombres que expresan el resultado, como `responderOk` y `responderNotFound`. Elegimos varias funciones pequeñas en lugar de una respuesta totalmente genérica. Una función que recibiera status, contenido y tipo hubiera ahorrado pocas líneas y todavía dejaría repetida la decisión del status. Además, un parámetro booleano para elegir JSON o texto sería menos claro al leer el controller.

La otra extracción fue la lógica de fechas. `calcularEdad` y `agregarEdad` no necesitan repositories, Express ni reglas exclusivas de alumnos. Por eso ahora viven en `fechas-helper.js` y pueden ser utilizadas por cualquier otra entidad. Conservamos el algoritmo original para que el resultado no cambiara y verificamos que `agregarEdad` siga creando un objeto nuevo mediante spread, sin mutar la entidad obtenida de la base.

Decidimos no extraer los bloques `try/catch`. Aunque visualmente se parecen, no todos manejan los errores igual: GET y DELETE suelen devolver 500, mientras POST y PUT devuelven 400. Crear un wrapper configurable para esas diferencias hubiera agregado abstracción y escondido una parte importante del comportamiento HTTP. Tampoco movimos los mensajes al helper, porque textos como el id inexistente o la diferencia entre el id de la URL y el body pertenecen al contexto del endpoint.

La verificación fue importante porque una refactorización correcta debe cambiar la organización interna sin cambiar el resultado observable. Primero comprobamos sintaxis e imports, después probamos cada función de respuesta con un objeto `res` simulado y finalmente levantamos la API contra la base configurada. Obtuvimos 200 en consultas válidas, 404 para ids inexistentes y 400 para entradas incorrectas. El GET de alumnos continuó agregando una edad numérica. El resultado final tiene responsabilidades más claras y permite cambiar el formato de una respuesta o reutilizar el cálculo de edad desde un solo lugar.

---

## 7. 🔗 Adjuntos

- [ ] Link o PDF de la conversación completa con la IA
- [ ] Commit en GitHub: pendiente de crear
- [x] Guía manual: `EJ3/PRUEBAS-POSTMAN.md`
- [x] Helpers: `src/helpers/respuestas-helper.js` y `src/helpers/fechas-helper.js`

