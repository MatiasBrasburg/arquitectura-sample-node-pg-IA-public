mati:

# Ejercicio 7 - Bitacora y entrega de testing

## Datos

- **Alumno:** Mati
- **Ejercicio:** 7 - Testing
- **Fecha:** 03/08/2026
- **Modelo usado:** ChatGPT / Codex

---

## 1. Que me pidieron

El ejercicio pide agregar tests a un proyecto que se venia probando manualmente con Postman. Habia que elegir un test runner, escribir tests unitarios para la logica de edad, agregar al menos un test de integracion de un endpoint y dejar un script `npm test`.

La parte mas importante era no quedarse solo con el happy path. Habia que cubrir casos borde como cumpleanos hoy, cumpleanos que todavia no llego, fecha invalida, `null` y pruebas que no dependan del dia real en que se ejecutan.

---

## 2. Prompts inventados usados

### Prompt 1

**Lo que escribi:**

```text
Actua como desarrollador backend senior en Node.js. Este proyecto no tiene tests y usa Express con ES modules. Quiero agregar testing sin instalar frameworks pesados. Primero listame casos borde valiosos para calcularEdad, incluyendo fechas invalidas, null y problemas con la fecha de hoy. No escribas codigo todavia.
```

**EFSI:**

- [x] Rol
- [x] Contexto
- [x] Tarea
- [x] Restricciones
- [x] Iteracion

**Que me devolvio, resumen:**

```text
La IA propuso probar cumpleanos ya pasado, cumpleanos hoy, cumpleanos no llegado, null, fecha invalida y fecha futura. Tambien aviso que los tests no debian usar new Date() directamente porque podian fallar otro dia.
```

**Que hice con eso:**

```text
Use esa lista como base, pero agregue un caso propio: fechas escritas como YYYY-MM-DD pueden correrse por zona horaria en JavaScript.
```

### Prompt 2

**Lo que escribi:**

```text
Ahora escribime tests con node:test nativo para calcularEdad y agregarEdad. No uses Jest ni Vitest. Los esperados tienen que estar calculados a mano y la fecha actual tiene que ser fija para que el test no cambie con el tiempo.
```

**EFSI:**

- [x] Rol
- [x] Contexto
- [x] Tarea
- [x] Restricciones
- [x] Iteracion

**Que me devolvio, resumen:**

```text
La IA sugirio usar node:test y node:assert/strict. Tambien recomendo pasar una fecha fija a la funcion para no mockear todo el reloj del sistema.
```

**Que hice con eso:**

```text
Adapte calcularEdad para aceptar una fecha actual opcional. Asi la app sigue funcionando igual, pero los tests pueden pasar una fecha fija.
```

### Prompt 3

**Lo que escribi:**

```text
Necesito un test de integracion de un endpoint, pero no quiero depender de PostgreSQL para este ejercicio. Que endpoint conviene probar y como hago para no levantar el server dos veces?
```

**EFSI:**

- [x] Rol
- [x] Contexto
- [x] Tarea
- [x] Restricciones
- [x] Iteracion

**Que me devolvio, resumen:**

```text
La IA recomendo probar POST /api/auth/login con credenciales invalidas porque valida status code 401 y body sin tocar la base. Tambien sugirio exportar la app de Express desde server.js y escuchar en un puerto dinamico durante el test.
```

**Que hice con eso:**

```text
Modifique server.js para exportar app y solo hacer app.listen cuando se ejecuta como modulo principal. Despues escribi el test de integracion con fetch.
```

### Prompt 4

**Lo que escribi:**

```text
Revisame si estos tests prueban algo real o si son tautologicos. Quiero un caso que falle si rompo calcularEdad a proposito.
```

**EFSI:**

- [x] Rol
- [x] Contexto
- [x] Tarea
- [x] Restricciones
- [x] Iteracion

**Que me devolvio, resumen:**

```text
La IA marco que el test de cumpleanos todavia no llegado era el mas sensible. Si se cambia edad-- por edad++, ese test tiene que fallar.
```

**Que hice con eso:**

```text
Hice una mutacion temporal cambiando edad-- por edad++. npm test fallo como esperaba. Despues reverti el cambio y npm test volvio a pasar.
```

---

## 3. Que hizo la IA y que hice yo

| Archivo / parte | Lo genero la IA | Lo modifique yo | Por que |
|---|---:|---:|---|
| `package.json` | Si | Si | Se agrego el script `npm test` usando `node --test`. |
| `src/helpers/fechas-helper.js` | Si | Si | Se hizo testeable `calcularEdad` con fecha fija y se corrigieron fechas invalidas/futuras. |
| `src/server.js` | Si | Si | Se exporto `app` para poder hacer test de integracion sin levantar el server dos veces. |
| `test/fechas-helper.test.js` | Si | Si | Tests unitarios de edad y de `agregarEdad`. |
| `test/auth-controller.test.js` | Si | Si | Test de integracion de `POST /api/auth/login` con credenciales invalidas. |
| `EJ7/mati-ej7.md` | Si | Si | Bitacora separada con prompts inventados y evidencia. |

---

## 4. Tests agregados

### Unitarios

Archivo:

```text
test/fechas-helper.test.js
```

Casos cubiertos:

```text
1. Cumpleanos ya paso.
2. Cumpleanos es hoy.
3. Cumpleanos todavia no llego.
4. Fecha null.
5. Fecha invalida textual.
6. Fecha calendario invalida, por ejemplo 2026-02-31.
7. Fecha futura.
8. agregarEdad agrega edad sin perder campos.
9. agregarEdad devuelve null si recibe null.
```

### Integracion

Archivo:

```text
test/auth-controller.test.js
```

Caso cubierto:

```text
POST /api/auth/login con credenciales invalidas devuelve 401 y body con "Credenciales incorrectas".
```

Elegí ese endpoint porque no depende de PostgreSQL y permite verificar status code real de Express.

---

## 5. Cambios de codigo

### `calcularEdad`

Antes usaba siempre `new Date()` internamente. Ahora acepta una fecha actual opcional:

```text
calcularEdad(fechaNacimiento, fechaActual = new Date())
```

Eso permite tests deterministas.

Tambien se corrigio:

```text
1. Fecha invalida -> null.
2. Fecha futura -> null.
3. Fechas YYYY-MM-DD -> parseo local para evitar errores por zona horaria.
4. Fechas calendario imposibles como 2026-02-31 -> null.
```

### `server.js`

Antes `server.js` levantaba el servidor apenas se importaba. Eso complica tests de integracion.

Ahora:

```text
1. Exporta app.
2. Solo ejecuta app.listen si server.js se corre directamente.
```

---

## 6. Verificacion

### `npm test`

Resultado final:

```text
tests 7
pass 7
fail 0
```

Casos visibles en la salida:

```text
POST /api/auth/login devuelve 401 con credenciales invalidas
calcularEdad devuelve la edad cuando el cumpleaños ya paso
calcularEdad devuelve la edad cuando el cumpleaños es hoy
calcularEdad resta un año cuando el cumpleaños todavia no llego
calcularEdad devuelve null para null, fecha invalida o fecha futura
agregarEdad conserva el objeto y agrega edad calculada
agregarEdad devuelve el mismo valor si recibe null
```

### `node --check`

Comando usado:

```powershell
Get-ChildItem -Recurse -Filter *.js src,test | ForEach-Object { node --check $_.FullName }
```

Resultado:

```text
OK - sin errores de sintaxis.
```

### Mutacion temporal

Para verificar que los tests no eran inutiles, cambie temporalmente:

```js
edad--;
```

por:

```js
edad++;
```

Resultado esperado y obtenido:

```text
El test "calcularEdad resta un año cuando el cumpleaños todavia no llego" fallo.
Esperaba 19 y recibio 21.
```

Despues reverti el cambio y `npm test` volvio a pasar.

---

## 7. Diferencia entre test unitario e integracion

```text
Un test unitario prueba una funcion aislada, sin servidor ni base de datos. En este ejercicio, calcularEdad es unitario porque recibe valores y devuelve un resultado.

Un test de integracion prueba varias piezas trabajando juntas. En este ejercicio, POST /api/auth/login usa Express, el router de auth, el parseo JSON y la respuesta HTTP real.
```

---

## 8. Caso borde que pense yo

```text
El caso que agregue yo fue el problema de zona horaria con fechas YYYY-MM-DD. En JavaScript, new Date("2006-08-04") se interpreta como UTC. En Argentina eso puede caer el dia anterior a la noche, entonces el calculo del cumpleaños puede dar mal. Por eso agregue un parseo local para strings con formato YYYY-MM-DD.

Despues de revisar de nuevo tambien agregue otro borde relacionado: fechas calendario imposibles como 2026-02-31. JavaScript puede normalizarlas a marzo en vez de marcarlas como invalidas, asi que el helper ahora las rechaza y devuelve null.
```

---

## 9. Reflexion

```text
En este ejercicio aprendi que escribir tests no es solamente hacer que npm test diga verde. Un test sirve si puede ponerse rojo cuando el codigo esta mal. Por eso primero pense los casos borde de calcularEdad antes de escribir codigo. Los mas importantes eran cumpleaños ya pasado, cumpleaños hoy y cumpleaños que todavia no llego, porque ahi esta la logica principal de edad.

Tambien aparecieron casos de entrada invalida. Antes la funcion podia devolver NaN si recibia una fecha invalida, y podia devolver una edad negativa si la fecha estaba en el futuro. Para una API eso no es bueno, porque despues el error se propaga como si fuera un dato valido. Por eso decidi que esos casos devuelvan null.

El punto mas interesante fue el de zona horaria. Los strings YYYY-MM-DD parecen simples, pero JavaScript los interpreta como UTC. En Argentina eso puede mover la fecha al dia anterior cuando se usan getDate, getMonth y getFullYear. Ese fue el caso borde que agregue yo y que no siempre aparece en una primera respuesta de IA.

Para el test de integracion elegi auth/login con credenciales invalidas. No depende de PostgreSQL, pero prueba Express de verdad: endpoint, metodo POST, body JSON, status code 401 y texto de respuesta. Para eso tuve que modificar server.js para exportar app y evitar que el servidor se levante automaticamente al importarlo.

Por ultimo hice una prueba de mutacion manual: cambie edad-- por edad++ y npm test fallo. Eso demuestra que al menos uno de los tests detecta una rotura real de la logica. Despues reverti el cambio y todos los tests volvieron a pasar.
```

---

## 10. Adjuntos

- [ ] Conversacion completa con IA: pendiente de exportar.
- [ ] Commit en GitHub: pendiente.
- [ ] Capturas de terminal/Postman: pendiente.

---

## 11. Ampliacion de testing general - 10/08/2026

Despues de la primera entrega se aplico la estrategia completa de la guia `GUIA-NODE-TEST.pdf` al proyecto, no solamente los requisitos minimos del ejercicio 7.

Se reorganizo la suite en `test/unit` y `test/integration` y se agregaron scripts separados para ejecutar tests unitarios, de integracion, en modo watch y con cobertura. Los nuevos tests recorren las familias de casos propuestas en la guia: caso tipico, bordes, minimos y maximos, fuera de rango, nulos/vacios e invalidos.

Tambien se incorporaron mocks manuales e inyeccion de dependencias para probar `AlumnosService` y `CalificacionesService` sin levantar PostgreSQL. Se comprueba tanto el resultado como el comportamiento: por ejemplo, ante un curso inexistente o una calificacion duplicada, el repository no debe escribir.

La ampliacion incluye pruebas del middleware JWT para header ausente, formato incorrecto, configuracion faltante, firma invalida, token vencido y token valido. En calificaciones se cubren create y update, incluida la traduccion del error PostgreSQL `23505` a conflicto HTTP 409.

Resultado actualizado: `38 tests`, `38 pass`, `0 fail`. La cobertura se verifica con `npm run test:coverage` y la suite completa sigue sin depender de una base de datos activa.
