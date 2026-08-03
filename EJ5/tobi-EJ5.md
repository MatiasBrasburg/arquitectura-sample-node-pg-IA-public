

# Bitacora de Prompts - Ejercicio Nro. 5

## Datos

- **Alumno/a:** tobi
- **Ejercicio:** Nro. 5 - Middleware de Autenticacion con JWT
- **Fecha:** 03/08/2026
- **Modelo de IA usado:** ChatGPT / Codex

---

## 1. Que me pidieron

El ejercicio pide agregar autenticacion con JWT a la API de Node.js y Express. La idea es crear un login que devuelva un token firmado, validar ese token con un middleware y proteger las operaciones que modifican datos, sin dejar secretos hardcodeados ni endpoints de escritura abiertos.

Tambien habia que revisar criticamente lo que proponga la IA, porque en seguridad no alcanza con que el codigo "ande": hay que verificar que use `jwt.verify`, que el token expire, que el secreto salga del `.env` y que los errores devuelvan 401 cuando corresponde.

---

## 2. Mis prompts en orden

### Prompt #1

**Lo que escribi:**

```text
Primero ponete en el rol de un desarrollador back-end experto en Node.js. Necesito que me digas si el ejercicio 4 esta terminado y arrancar el 5.
```

**Auto-chequeo de las 5 partes EFSI:**

- [x] Rol
- [x] Contexto
- [x] Tarea
- [ ] Restricciones
- [x] Iteracion

**Que me devolvio, resumen:**

```text
La IA reviso el proyecto y encontro que el ejercicio 4 estaba bastante completo a nivel estructura y sintaxis: validaciones, codigos de error, CRUD de calificaciones y helpers de respuesta. Tambien aviso que no se podia confirmar todo con base de datos porque PostgreSQL local no respondia. Despues empezo a revisar el enunciado del ejercicio 5.
```

**Me sirvio tal cual o tuve que corregir/repreguntar:**

```text
Sirvio para ubicar el estado del proyecto, pero tuve que frenar para aclarar como queria separar la entrega porque habia otra persona trabajando sobre lo mismo.
```

### Prompt #2

**Lo que escribi:**

```text
quiero que hagas poco a poco el ejercicio 5, leyendo las restricciones que este ejercicio mide, manteniendome al tanto de todo lo que vas haciendo y preguntandome si algo no entendes
```

**Auto-chequeo de las 5 partes EFSI:**

- [x] Rol
- [x] Contexto
- [x] Tarea
- [x] Restricciones
- [x] Iteracion

**Que me devolvio, resumen:**

```text
La IA entendio que primero no tenia que seguir tocando codigo para no pisar cambios de otra persona. Leyo la plantilla de bitacora y preparo el enfoque para armar el archivo del ejercicio 5 empezando con "mati:".
```

**Me sirvio tal cual o tuve que corregir/repreguntar:**

```text
Tuve que corregir la instruccion, porque no queria solamente una bitacora inventada: queria que tambien se haga el ejercicio, pero manteniendo esa separacion en el .md.
```

### Prompt #3

**Lo que escribi:**

```text
Para para quiero que hagas el ejercicio, solo que con esa especificacion de separar las cosas.
```

**Auto-chequeo de las 5 partes EFSI:**

- [x] Rol
- [x] Contexto
- [x] Tarea
- [x] Restricciones
- [x] Iteracion

**Que me devolvio, resumen:**

```text
La IA retomo el trabajo completo del ejercicio 5. Reviso el estado actual para no pisar trabajo de otra persona, detecto que ya estaban agregados jsonwebtoken, auth-controller, auth-middleware y la proteccion de rutas. Despues completo lo faltante: asegurar que .env quede ignorado y documentar la entrega separada en EJ5/EJ5.md.
```

**Me sirvio tal cual o tuve que corregir/repreguntar:**

```text
Sirvio porque la implementacion quedo alineada con el enunciado y la entrega queda separada para Mati.
```

---

## 3. Que hizo la IA y que hice yo

| Archivo / funcion | Lo genero la IA | Lo modifique/escribi yo | Por que |
|---|---:|---:|---|
| `package.json` / `package-lock.json` | Si | Si | Se agrego `jsonwebtoken`, dependencia necesaria para firmar y verificar JWT. |
| `src/controllers/auth-controller.js` | Si | Si | Se agrego `POST /api/auth/login`, leyendo `AUTH_USERNAME`, `AUTH_PASSWORD`, `JWT_SECRET` y `JWT_EXPIRES_IN` desde variables de entorno. |
| `src/middlewares/auth-middleware.js` | Si | Si | Se agrego el middleware que valida `Authorization: Bearer <token>` usando `jwt.verify`. |
| `src/controllers/alumnos-controller.js` | Si | Si | Se protegieron las rutas que modifican datos y tambien `test-insert`, porque aunque es GET escribe en la base. |
| `src/controllers/cursos-controller.js` | Si | Si | Se protegieron POST, PUT y DELETE con JWT. |
| `src/controllers/materias-controller.js` | Si | Si | Se protegieron POST, PUT y DELETE con JWT. |
| `src/controllers/calificaciones-controller.js` | Si | Si | Se protegieron POST, PUT y DELETE con JWT. |
| `src/server.js` | Si | Si | Se registro el router `/api/auth` para exponer el login. |
| `.env-template` | Si | Si | Se agregaron variables de ejemplo para autenticacion sin poner secretos reales. |
| `.gitignore` | Si | Si | Se agrego `.env` para evitar commitear secretos locales. |
| `EJ5/EJ5.md` | Si | Si | Se dejo la entrega separada empezando con `mati:` como se pidio. |

Comentarios pedidos en codigo:

- `// [IA]` aparece en el middleware explicando por que se usa `verify` y no `decode`.
- `// [YO]` aparece en el controller de auth y en alumnos para justificar decisiones de seguridad.

---

## 4. Errores o cosas mal que detecte en la respuesta de la IA

```text
1. La IA podia proponer un secreto hardcodeado como "mi-secreto". Eso no sirve para el ejercicio ni para seguridad real. Se corrigio leyendo JWT_SECRET desde process.env.

2. La IA podia usar jwt.decode en el middleware. Eso esta mal porque decode solo lee el payload, pero no valida la firma. Se dejo jwt.verify, que valida firma y expiracion.

3. La IA podia generar un token sin vencimiento. Se agrego expiresIn usando JWT_EXPIRES_IN o 1h como valor por defecto.

4. La IA podia proteger solamente POST, PUT y DELETE y olvidarse de /api/alumnos/test-insert. Ese endpoint es GET, pero escribe en la base. Por eso tambien se protegió.

5. La IA podia comparar usuario y clave con == o === sin pensar en seguridad. Se uso timingSafeEqual para evitar una comparacion directa insegura. Igual se aclara que en produccion deberia usarse hash con bcrypt y una tabla de usuarios.

6. La IA podia dejar .env fuera del .gitignore. Eso es un problema porque ahi vive JWT_SECRET. Se agrego .env al .gitignore y se dejo .env-template como ejemplo.

7. La IA podia meter datos sensibles en el payload del token. Se dejo solamente un identificador de usuario y no se incluye la clave.
```

---

## 5. Verificacion

Checklist del ejercicio y evidencia esperada/comprobada:

```text
[x] POST /api/auth/login con credenciales correctas devuelve un token.
    Evidencia real: prueba HTTP local devolvio login_ok_token_presente.
    Prueba manual equivalente:
    POST http://localhost:3000/api/auth/login
    Body:
    {
      "usuario": "admin",
      "clave": "la_clave_configurada_en_env"
    }

[x] POST /api/auth/login con credenciales incorrectas devuelve 401.
    Evidencia real: prueba HTTP local devolvio login_bad_401.

[x] DELETE /api/alumnos/3 sin header Authorization devuelve 401.
    Evidencia real: prueba HTTP local devolvio delete_without_token_401.

[x] Token invalido o mal formado devuelve 401.
    Evidencia real: prueba HTTP local devolvio invalid_token_401.

[x] Token vencido devuelve 401.
    Evidencia real: prueba HTTP local devolvio expired_token_401.

[x] Token valido permite continuar la operacion.
    Evidencia real: prueba HTTP local devolvio valid_token_not_401_route_continued. La ruta siguio despues del middleware; el resultado final depende de PostgreSQL.

[x] El secreto esta en .env / .env-template, no hardcodeado en archivos .js.
    Evidencia: auth-controller.js y auth-middleware.js leen process.env.JWT_SECRET.

[x] El middleware usa jwt.verify y no jwt.decode.
    Evidencia: src/middlewares/auth-middleware.js usa jwt.verify.

[x] .env esta en .gitignore.
    Evidencia: .gitignore incluye .env.
```

Comandos usados para verificar sintaxis:

```powershell
node --check src/server.js
node --check src/controllers/auth-controller.js
node --check src/middlewares/auth-middleware.js
node --check src/controllers/alumnos-controller.js
node --check src/controllers/cursos-controller.js
node --check src/controllers/materias-controller.js
node --check src/controllers/calificaciones-controller.js
```

Comandos/casos HTTP ejecutados:

```text
login_ok_token_presente
login_bad_401
delete_without_token_401
invalid_token_401
expired_token_401
valid_token_not_401_route_continued
```

Limitacion de verificacion:

```text
La verificacion HTTP completa depende de levantar el server con las variables de entorno y tener PostgreSQL disponible. Si la base local no esta levantada, se puede probar login y errores 401 del middleware, pero las operaciones reales contra tablas pueden fallar por conexion a DB.
```

---

## 6. Reflexion

```text
En este ejercicio el objetivo no era solamente agregar un login, sino entender que partes de una autenticacion JWT son importantes para no dejar un agujero de seguridad. Primero revise el estado del proyecto y el ejercicio anterior, porque no tenia sentido arrancar el 5 si el 4 habia quedado roto. A nivel codigo, el ejercicio 4 estaba encaminado: habia validaciones, helpers de respuestas y CRUD de calificaciones. La parte que no se pudo confirmar totalmente fue la prueba contra base de datos, porque dependia de PostgreSQL local.

Para el ejercicio 5 decidi mantener una separacion simple: los GET de lectura quedan publicos y las operaciones que modifican datos quedan protegidas. Esa decision tiene sentido para una API educativa donde consultar alumnos, cursos, materias o calificaciones no requiere login, pero crear, editar o borrar si tiene impacto sobre la informacion. Tambien revise un caso especial: /api/alumnos/test-insert es GET, pero inserta datos. Aunque el metodo HTTP sea GET, la ruta modifica la base, entonces tambien tiene que pedir JWT.

La IA ayuda bastante porque JWT en Express es un patron conocido, pero hay que revisar los detalles. Una version mala podria traer un secreto hardcodeado, usar jwt.decode en lugar de jwt.verify, no poner expiracion o devolver errores 500 cuando en realidad corresponde 401. Eso se corrigio dejando JWT_SECRET en variables de entorno, firmando con expiresIn y validando el token con jwt.verify. Tambien se diferencian casos como header faltante, formato incorrecto, token invalido y token vencido.

Otra decision importante fue no poner informacion sensible dentro del token. Un JWT no esta encriptado: esta firmado y codificado, pero cualquiera puede leer el payload. Por eso no se incluye la clave. Para el login se usan usuario y clave configurados por entorno porque el TP no pide tabla de usuarios, pero en produccion esto deberia cambiar por usuarios en base de datos y contrasenas hasheadas con bcrypt. Tambien se agrego .env al .gitignore, porque commitear el secreto haria inutil la firma del token.

Lo mas importante que aprendi es que en seguridad no alcanza con que una prueba feliz funcione. Hay que probar tambien ausencia de token, token mal formado, token vencido, token alterado y rutas que parecen de lectura pero en realidad escriben. Esa revision es la diferencia entre copiar un ejemplo y entregar una solucion defendible en el oral.
```

---

## 7. Adjuntos

- [ ] Link/PDF de la conversacion completa con la IA: pendiente de exportar desde la herramienta usada.
- [ ] Commit(s) en GitHub: pendiente de crear cuando se cierre el ejercicio.
- [ ] Capturas / evidencias de verificacion: pendiente de capturar en Postman o Thunder Client al levantar el server.
