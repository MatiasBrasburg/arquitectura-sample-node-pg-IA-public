# Ejercicio 7 - Bitacora y entrega de testing

## Datos

- **Alumno:** tobi
- **Ejercicio:** 7 - Testing
- **Fecha:** 03/08/2026
- **Proyecto:** API Node.js + Express + PostgreSQL
- **Modelo usado:** ChatGPT / Codex

---

## 1. Que habia que hacer

El objetivo era agregar una base de tests automatizados a un proyecto que venia probandose a mano con Postman. La consigna pedia elegir un test runner, agregar tests unitarios para `calcularEdad`, cubrir casos borde y sumar al menos un test de integracion de un endpoint.

La decision fue usar `node:test`, el runner nativo de Node.js, porque ya viene incluido y alcanza para este proyecto. No hizo falta instalar Jest, Vitest ni Supertest.

---

## 2. Prompts usados

### Prompt 1

**Lo que pedi:**

```text
Actua como desarrollador back-end experto en Node.js. Estoy en una API Express con type module y sin framework de tests. Antes de escribir codigo, revisa que casos borde deberia testear para una funcion calcularEdad(fechaNacimiento), incluyendo null, fecha invalida, fecha futura y cumpleanos alrededor de la fecha actual. No escribas tests todavia.
```

**EFSI:**

- [x] Rol
- [x] Contexto
- [x] Tarea
- [x] Restricciones
- [x] Iteracion

**Respuesta resumida:**

```text
La IA propuso probar cumpleanos ya pasado, cumpleanos hoy, cumpleanos todavia no llegado, null, texto invalido y fecha futura. Tambien aviso que no conviene depender de new Date() real porque el test puede cambiar segun el dia.
```

**Que hice con eso:**

```text
Use una fecha fija para los tests: 2026-08-03. Asi los resultados esperados no dependen del dia en que se corre npm test.
```

### Prompt 2

**Lo que pedi:**

```text
Ahora escribi tests con node:test y node:assert/strict. No uses Jest ni dependencias externas. Los valores esperados tienen que estar calculados a mano, no usando la misma funcion como oraculo. Agrega tambien un caso para agregarEdad.
```

**EFSI:**

- [x] Rol
- [x] Contexto
- [x] Tarea
- [x] Restricciones
- [x] Iteracion

**Respuesta resumida:**

```text
La IA genero tests unitarios para calcularEdad y agregarEdad. Cubria cumpleanos antes, hoy y despues, ademas de null, fecha invalida y fecha futura.
```

**Que hice con eso:**

```text
Revise que no fueran tests tautologicos. Despues agregue dos casos propios: una fecha imposible como 2026-02-31 y una fecha bisiesta, 2004-02-29.
```

### Prompt 3

**Lo que pedi:**

```text
Necesito al menos un test de integracion de un endpoint Express. Evita depender de PostgreSQL porque puede no estar levantado. Usa el app exportado desde server.js y fetch contra un puerto aleatorio. El test debe validar status code y body.
```

**EFSI:**

- [x] Rol
- [x] Contexto
- [x] Tarea
- [x] Restricciones
- [x] Iteracion

**Respuesta resumida:**

```text
La IA propuso probar POST /api/auth/login porque no necesita base de datos. El test levanta la app en puerto 0, manda credenciales y valida la respuesta.
```

**Que hice con eso:**

```text
Deje un test de credenciales invalidas con 401 y agregue otro de credenciales validas que espera 200, tokenType Bearer y un token no vacio.
```

---

## 3. Cambios hechos en el proyecto

| Archivo | Cambio | Motivo |
|---|---|---|
| `package.json` | Script `npm test` con `node --test` | Permite correr todos los tests con un comando. |
| `test/fechas-helper.test.js` | Tests unitarios de edad y agregarEdad | Cubrir logica pura sin base de datos. |
| `test/auth-controller.test.js` | Tests de integracion de login | Verificar endpoint real con status code y body. |
| `src/server.js` | Exporta `app` y solo escucha si es modulo principal | Permite importar la app desde tests sin abrir siempre el puerto 3000. |
| `EJ7/EJ7.md` | Bitacora separada | Deja documentada mi version del ejercicio. |

---

## 4. Decision tecnica principal

```text
Use node:test porque es suficiente para este proyecto y evita agregar dependencias. Como el repo ya usa ES Modules, los tests pueden importar directamente con import.

Para integracion elegi /api/auth/login porque no necesita PostgreSQL. Eso hace que npm test pueda correr aunque la base no este levantada. Igual sigue siendo integracion porque levanta Express y pega contra un endpoint HTTP real.
```

---

## 5. Casos cubiertos

```text
Unitarios:
1. Cumpleanos ya paso.
2. Cumpleanos es hoy.
3. Cumpleanos todavia no llego.
4. Fecha null.
5. Texto invalido.
6. Fecha imposible, como 2026-02-31.
7. Fecha futura.
8. Fecha bisiesta 2004-02-29.
9. agregarEdad agrega edad sin perder campos.
10. agregarEdad devuelve null si recibe null.

Integracion:
1. POST /api/auth/login con clave incorrecta devuelve 401 y mensaje.
2. POST /api/auth/login con clave correcta devuelve 200, tokenType Bearer y token.
```

---

## 6. Verificacion

Comando ejecutado:

```text
npm test
```

Resultado:

```text
tests 9  
pass 9
fail 0
```

Checklist del ejercicio:

```text
[x] npm test corre y los tests pasan.
[x] Hay tests que fallarian si se rompe calcularEdad.
[x] Hay caso para fecha invalida.
[x] Hay caso para null.
[x] El test de fecha no depende del dia real.
[x] El test de integracion verifica status code y body.
[x] Puedo explicar la diferencia entre unitario e integracion.
```

Limitacion:

```text
No se agregaron tests de CRUD contra PostgreSQL porque eso requiere base cargada y datos controlados. Para este ejercicio elegi un endpoint que permite probar integracion sin depender del estado externo de la base.
```

---

## 7. Reflexion

```text
En este ejercicio entendi que un test util no es solamente un archivo que pasa en verde. Tiene que tener un resultado esperado calculado por mi y tiene que fallar si la logica se rompe. Por eso evite tests tautologicos como comparar calcularEdad(fecha) contra calcularEdad(fecha).

La primera decision fue elegir node:test. Para este proyecto me parecio mejor que Jest o Vitest porque no hace falta instalar nada y el objetivo no era aprender un framework grande, sino cubrir logica real. Tambien use node:assert/strict para que las comparaciones sean claras.

Para calcularEdad use una fecha actual fija. Esto es importante porque si el test usa new Date() directamente, puede pasar un dia y fallar otro. Los casos principales fueron cumpleanos ya pasado, cumpleanos hoy y cumpleanos todavia no llegado. Tambien cubri null, fecha invalida y fecha futura porque son casos borde donde JavaScript suele enganar: new Date("texto") genera Invalid Date y puede terminar en NaN si no se valida.

Un caso que agregue yo y no venia en la primera lista de la IA fue el nacimiento en dia bisiesto, 2004-02-29. No es el caso mas comun, pero sirve para revisar que la funcion no se rompa con fechas reales que no existen todos los anios.

Para el test de integracion elegi /api/auth/login. No depende de PostgreSQL, pero igual prueba Express de punta a punta: se levanta la app en un puerto aleatorio, se manda un POST real y se valida el status code y el body. Agregue un caso 401 para credenciales invalidas y un caso 200 para credenciales validas.

La diferencia que me queda clara es que el test unitario prueba una funcion pura sin red, sin Express y sin base de datos. El test de integracion prueba varias piezas juntas: router, middleware de JSON, controller y respuesta HTTP.
```

---

## 8. Adjuntos

- [ ] Conversacion completa con IA: pendiente de exportar.
- [ ] Commit en GitHub: pendiente.
- [ ] Capturas / evidencias: pendiente.

---

## 9. Ampliacion de testing general - 10/08/2026

Despues de la primera entrega se aplico la estrategia completa de la guia `GUIA-NODE-TEST.pdf` al proyecto, no solamente los requisitos minimos del ejercicio 7.

Se reorganizo la suite en `test/unit` y `test/integration` y se agregaron scripts separados para ejecutar tests unitarios, de integracion, en modo watch y con cobertura. Los nuevos tests recorren las familias de casos propuestas en la guia: caso tipico, bordes, minimos y maximos, fuera de rango, nulos/vacios e invalidos.

Tambien se incorporaron mocks manuales e inyeccion de dependencias para probar `AlumnosService` y `CalificacionesService` sin levantar PostgreSQL. Se comprueba tanto el resultado como el comportamiento: por ejemplo, ante un curso inexistente o una calificacion duplicada, el repository no debe escribir.

La ampliacion incluye pruebas del middleware JWT para header ausente, formato incorrecto, configuracion faltante, firma invalida, token vencido y token valido. En calificaciones se cubren create y update, incluida la traduccion del error PostgreSQL `23505` a conflicto HTTP 409.

Resultado actualizado: `38 tests`, `38 pass`, `0 fail`. La cobertura se verifica con `npm run test:coverage` y la suite completa sigue sin depender de una base de datos activa.
