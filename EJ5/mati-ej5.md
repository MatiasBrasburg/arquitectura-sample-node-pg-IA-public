mati:

# Ejercicio 5 - Bitacora y entrega JWT

## Datos

- **Alumno:** Mati
- **Ejercicio:** 5 - Middleware de autenticacion con JWT
- **Fecha:** 03/08/2026
- **Proyecto:** API Node.js + Express + PostgreSQL
- **Modelo usado:** ChatGPT / Codex

---

## 1. Que habia que hacer

El objetivo era agregar autenticacion a la API. Antes del ejercicio 5 cualquier persona podia llamar endpoints que modificaban datos, por ejemplo borrar alumnos, cursos o materias. Para resolverlo habia que crear un login que devuelva un JWT y despues validar ese token con un middleware.

Mi decision fue dejar publicos los endpoints `GET`, porque son de lectura, y proteger todos los endpoints que escriben datos: `POST`, `PUT` y `DELETE`. Tambien protegi `GET /api/alumnos/test-insert`, porque aunque sea un GET, crea un alumno en la base.

---

## 2. Prompts usados

### Prompt 1

**Lo que pedi:**

```text
Ponete en el rol de un desarrollador back-end experto en Node.js. Necesito saber si el ejercicio 4 esta terminado y arrancar el ejercicio 5.
```

**EFSI:**

- [x] Rol
- [x] Contexto
- [x] Tarea
- [ ] Restricciones
- [x] Iteracion

**Respuesta resumida:**

```text
La IA reviso el repo y encontro que el ejercicio 4 estaba encaminado: habia validaciones, helpers, codigos de error y CRUD de calificaciones. Tambien aviso que no podia confirmar pruebas integradas si PostgreSQL no estaba disponible. Despues empezo a analizar el enunciado del ejercicio 5.
```

**Que hice con eso:**

```text
Use esa revision para considerar terminado el ejercicio 4 a nivel codigo y pasar al 5. La aclaracion importante fue que las pruebas con base de datos dependen de tener PostgreSQL levantado.
```

### Prompt 2

**Lo que pedi:**

```text
quiero que hagas poco a poco el ejercicio 5, leyendo las restricciones que este ejercicio mide, siguiendo con el guion del ejercicio y sin inventar nada por favor, manteniendome al tanto de todo lo que vas haciendo y preguntandome si algo no entendes

```

**EFSI:**

- [x] Rol
- [x] Contexto
- [x] Tarea
- [x] Restricciones
- [x] Iteracion

**Respuesta resumida:**

```text
La IA entendio que la entrega tenia que quedar separada para no mezclar mi parte con la de otra persona. Primero interpreto que solo habia que hacer el markdown, pero despues se corrigio esa idea.
```

**Que hice con eso:**

```text
Aclare que no queria solamente documentacion, sino tambien hacer el ejercicio completo y dejar mi entrega separada.
```

### Prompt 3

**Lo que pedi:**

```text
Quiero que hagas el ejercicio, solo que con esa especificacion de separar las cosas.
```

**EFSI:**

- [x] Rol
- [x] Contexto
- [x] Tarea
- [x] Restricciones
- [x] Iteracion

**Respuesta resumida:**

```text
La IA reviso los cambios existentes, encontro que ya estaba agregada la dependencia jsonwebtoken y que habia archivos nuevos para auth y middleware. Despues completo la integracion, reviso las rutas protegidas y agrego la documentacion separada.
```

**Que hice con eso:**

```text
Valide que la solucion no sea solo copiar un ejemplo de JWT. Revise que use variables de entorno, que tenga expiracion, que use jwt.verify y que .env no quede commiteado.
```

---

## 3. Cambios hechos en el proyecto

| Archivo | Cambio | Motivo |
|---|---|---|
| `package.json` | Se agrego `jsonwebtoken` | Necesario para crear y verificar tokens JWT. |
| `package-lock.json` | Se actualizo por la dependencia | Mantiene versiones instaladas. |
| `src/controllers/auth-controller.js` | Se creo el endpoint `POST /api/auth/login` | Permite loguearse y recibir un token. |
| `src/middlewares/auth-middleware.js` | Se creo el middleware de autenticacion | Valida `Authorization: Bearer <token>`. |
| `src/server.js` | Se registro `/api/auth` | Expone el login en la API. |
| `src/controllers/alumnos-controller.js` | Se protegieron rutas de escritura y `test-insert` | Evita modificaciones sin token. |
| `src/controllers/cursos-controller.js` | Se protegieron `POST`, `PUT`, `DELETE` | Evita modificaciones sin token. |
| `src/controllers/materias-controller.js` | Se protegieron `POST`, `PUT`, `DELETE` | Evita modificaciones sin token. |
| `src/controllers/calificaciones-controller.js` | Se protegieron `POST`, `PUT`, `DELETE` | Evita modificaciones sin token. |
| `src/helpers/respuestas-helper.js` | Se agrego respuesta 401 reutilizable | Mantiene el estilo del proyecto. |
| `.env-template` | Se agregaron variables de auth | Documenta que necesita el proyecto. |
| `.gitignore` | Se agrego `.env` | Evita subir secretos al repo. |

---

## 4. Decisiones tecnicas

```text
1. El secreto del JWT se lee desde process.env.JWT_SECRET.
   No queda escrito dentro del codigo.

2. El token tiene expiracion.
   Se usa JWT_EXPIRES_IN desde .env o 1h como valor por defecto.

3. El middleware usa jwt.verify.
   No se usa jwt.decode porque decode no valida la firma.

4. Las rutas GET comunes quedan publicas.
   Son rutas de lectura y para este TP es aceptable.

5. /api/alumnos/test-insert queda protegida aunque sea GET.
   Ese endpoint inserta datos, entonces cuenta como escritura.

6. El payload del token no contiene la clave.
   Un JWT no esta encriptado; se puede leer el payload.

7. .env queda ignorado por Git.
   El archivo local existe, pero no deberia commitearse.
```

---

## 5. Problemas que habia que evitar

```text
Problema 1: secreto hardcodeado.
Correccion: usar process.env.JWT_SECRET.

Problema 2: token sin vencimiento.
Correccion: firmar con expiresIn.

Problema 3: usar jwt.decode.
Correccion: usar jwt.verify para validar firma y expiracion.

Problema 4: proteger solo por metodo HTTP y olvidarse de rutas raras.
Correccion: revisar comportamiento real de cada endpoint; por eso se protegio test-insert.

Problema 5: subir .env.
Correccion: agregar .env al .gitignore y sacarlo del indice de Git.

Problema 6: pensar que JWT es encriptado.
Correccion: no guardar datos sensibles en el payload.
```

---

## 6. Verificacion

### Sintaxis

Se ejecuto `node --check` sobre todos los archivos `.js` del proyecto.

Resultado:

```text
OK - no hubo errores de sintaxis.
```

### Seguridad JWT

Se buscaron usos inseguros como `jwt.decode` o secretos de ejemplo dentro de `src`.

Resultado:

```text
OK - no se encontro jwt.decode.
OK - no se encontraron secretos de ejemplo hardcodeados.
```

### Pruebas HTTP ejecutadas

```text
login_ok_token_presente
login_bad_401
delete_without_token_401
invalid_token_401
expired_token_401
valid_token_not_401_route_continued
```

Interpretacion:

```text
1. Login correcto devuelve token.
2. Login incorrecto devuelve 401.
3. DELETE sin Authorization devuelve 401.
4. Token invalido devuelve 401.
5. Token vencido devuelve 401.
6. Token valido no queda bloqueado por el middleware y llega a la ruta protegida.
```

Limitacion:

```text
Las pruebas de escritura real dependen de que PostgreSQL este levantado y tenga las tablas cargadas. La autenticacion se pudo probar igual porque los casos 401 ocurren antes de consultar la base.
```

---

## 7. Como probarlo manualmente

### Login correcto

```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "usuario": "admin",
  "clave": "la_clave_del_env"
}
```

Respuesta esperada:

```json
{
  "token": "eyJ...",
  "tokenType": "Bearer"
}
```

### Login incorrecto

```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "usuario": "admin",
  "clave": "incorrecta"
}
```

Respuesta esperada:

```text
401 Credenciales incorrectas.
```

### Ruta protegida sin token

```http
DELETE http://localhost:3000/api/alumnos/3
```

Respuesta esperada:

```text
401 Falta el header Authorization.
```

### Ruta protegida con token

```http
DELETE http://localhost:3000/api/alumnos/3
Authorization: Bearer TOKEN_VALIDO
```

Respuesta esperada:

```text
No debe devolver 401 por autenticacion. Puede devolver OK, not found o error de DB segun el estado de PostgreSQL.
```

---

## 8. Reflexion

```text
En este ejercicio entendi que agregar JWT no es solamente instalar una libreria y copiar un middleware. La parte importante es revisar como se firma el token, de donde sale el secreto, cuanto dura y que pasa cuando el cliente manda un token incorrecto.

La primera decision fue dejar publicas las rutas GET y proteger las rutas que modifican datos. Eso tiene sentido porque el problema principal del enunciado era que cualquiera podia borrar o modificar informacion. De todas formas, no me quede solo con el metodo HTTP: revise el caso de /api/alumnos/test-insert, que es GET pero crea un alumno. Como escribe en la base, tambien tiene que estar protegido.

La IA podia dar una solucion que parecia correcta pero tenia detalles inseguros. Por ejemplo, un secreto hardcodeado en el codigo hace que cualquiera con acceso al repo pueda firmar tokens. Tambien podia usar jwt.decode, que no sirve para autenticar porque solo lee el contenido del token. Por eso revise que el middleware use jwt.verify, que valida firma y vencimiento.

Otro punto importante fue el .env. El secreto del JWT tiene que vivir en variables de entorno y no debe subirse al repositorio. Por eso se agrego .env al .gitignore y se dejo .env-template como guia. Tambien se evito poner datos sensibles dentro del payload del token, porque JWT no esta encriptado: esta firmado, pero su contenido se puede leer.

Para comprobar el resultado no alcanza con probar el login correcto. Tambien probe login incorrecto, ausencia de header Authorization, token invalido, token vencido y token valido llegando a una ruta protegida. Esa parte me parece la mas importante para defender el ejercicio, porque muestra que se revisaron los casos donde normalmente se rompe la seguridad.
```

---

## 9. Adjuntos

- [ ] Conversacion completa con IA: pendiente de exportar.
- [ ] Commit en GitHub: pendiente.
- [ ] Capturas de Postman/Thunder Client: pendiente.

