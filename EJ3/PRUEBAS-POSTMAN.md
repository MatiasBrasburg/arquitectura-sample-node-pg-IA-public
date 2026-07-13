# Pruebas del ejercicio 3 en Postman

## Preparación

1. Instalá las dependencias con `npm install`.
2. Verificá que la base configurada en `.env` esté disponible.
3. Levantá la API con `npm run server`.
4. Usá como base `http://localhost:3000` (o reemplazá 3000 si cambiaste `PORT`).
5. En POST y PUT elegí **Body > raw > JSON**.

Las pruebas están ordenadas para que los registros creados puedan actualizarse y borrarse. Cuando un POST devuelva un número, guardalo como el id nuevo y reemplazá los textos `<ID_...>` de las URLs y bodies siguientes.

---

## 1. Alumnos y helper de fechas

### Listar alumnos

- **Método:** GET
- **URL:** `http://localhost:3000/api/alumnos`
- **Body:** ninguno
- **Esperado:** 200; devuelve un array y cada alumno debe incluir `edad`.

### Obtener un alumno

- **Método:** GET
- **URL:** `http://localhost:3000/api/alumnos/1`
- **Body:** ninguno
- **Esperado:** 200; el objeto debe incluir `fecha_nacimiento` y `edad`.

### Alumno inexistente

- **Método:** GET
- **URL:** `http://localhost:3000/api/alumnos/999999`
- **Body:** ninguno
- **Esperado:** 404 y texto `No se encontro la entidad (id:999999).`

### Crear un alumno

- **Método:** POST
- **URL:** `http://localhost:3000/api/alumnos`
- **Body:**

```json
{
  "nombre": "Prueba",
  "apellido": "Helper",
  "id_curso": 1,
  "fecha_nacimiento": "2008-08-27",
  "hace_deportes": true
}
```

- **Esperado:** 201 y un número. Guardalo como `<ID_ALUMNO>`.

### Consultar el alumno creado y su edad

- **Método:** GET
- **URL:** `http://localhost:3000/api/alumnos/<ID_ALUMNO>`
- **Body:** ninguno
- **Esperado:** 200; debe aparecer una `edad` numérica.

### Curso inexistente al crear

- **Método:** POST
- **URL:** `http://localhost:3000/api/alumnos`
- **Body:**

```json
{
  "nombre": "Curso",
  "apellido": "Inexistente",
  "id_curso": 999999,
  "fecha_nacimiento": "2008-01-01",
  "hace_deportes": false
}
```

- **Esperado:** 400 y texto `Error: El curso con id 999999 no existe.`

### Actualizar el alumno

- **Método:** PUT
- **URL:** `http://localhost:3000/api/alumnos/<ID_ALUMNO>`
- **Body:** reemplazá `<ID_ALUMNO>` por el número real.

```json
{
  "id": "<ID_ALUMNO>",
  "nombre": "Prueba actualizada"
}
```

- **Esperado:** 200 y body `1`.

### Error por ids distintos

- **Método:** PUT
- **URL:** `http://localhost:3000/api/alumnos/<ID_ALUMNO>`
- **Body:** usá un id distinto del de la URL.

```json
{
  "id": 999998,
  "nombre": "No debe actualizarse"
}
```

- **Esperado:** 400 y un mensaje indicando que los ids no coinciden.

### Borrar el alumno de prueba

- **Método:** DELETE
- **URL:** `http://localhost:3000/api/alumnos/<ID_ALUMNO>`
- **Body:** ninguno
- **Esperado:** 200 y body `null`.

### Confirmar el borrado

- **Método:** GET
- **URL:** `http://localhost:3000/api/alumnos/<ID_ALUMNO>`
- **Esperado:** 404.

---

## 2. Cursos

### Listar cursos

- **Método:** GET
- **URL:** `http://localhost:3000/api/cursos`
- **Esperado:** 200 y un array JSON.

### Curso inexistente

- **Método:** GET
- **URL:** `http://localhost:3000/api/cursos/999999`
- **Esperado:** 404.

### Crear un curso

- **Método:** POST
- **URL:** `http://localhost:3000/api/cursos`
- **Body:**

```json
{
  "nombre": "Curso helper"
}
```

- **Esperado:** 201 y un número. Guardalo como `<ID_CURSO>`.

### Actualizar el curso

- **Método:** PUT
- **URL:** `http://localhost:3000/api/cursos/<ID_CURSO>`
- **Body:** reemplazá `<ID_CURSO>` por el número real.

```json
{
  "id": "<ID_CURSO>",
  "nombre": "Curso helper actualizado"
}
```

- **Esperado:** 200 y body `1`.

### Error por ids distintos

- **Método:** PUT
- **URL:** `http://localhost:3000/api/cursos/<ID_CURSO>`
- **Body:**

```json
{
  "id": 999998,
  "nombre": "No debe actualizarse"
}
```

- **Esperado:** 400.

### Borrar el curso de prueba

- **Método:** DELETE
- **URL:** `http://localhost:3000/api/cursos/<ID_CURSO>`
- **Esperado:** 200 y body `null`. Como el curso es nuevo y no tiene alumnos, no debe existir conflicto de clave foránea.

### Confirmar el borrado

- **Método:** GET
- **URL:** `http://localhost:3000/api/cursos/<ID_CURSO>`
- **Esperado:** 404.

---

## 3. Materias

### Listar materias

- **Método:** GET
- **URL:** `http://localhost:3000/api/materias`
- **Esperado:** 200 y un array JSON.

### Materia inexistente

- **Método:** GET
- **URL:** `http://localhost:3000/api/materias/999999`
- **Esperado:** 404.

### Nombre obligatorio

- **Método:** POST
- **URL:** `http://localhost:3000/api/materias`
- **Body:**

```json
{
  "nombre": ""
}
```

- **Esperado:** 400 y texto `Error: El nombre es obligatorio.`

### Crear una materia

- **Método:** POST
- **URL:** `http://localhost:3000/api/materias`
- **Body:**

```json
{
  "nombre": "Materia helper"
}
```

- **Esperado:** 201 y un número. Guardalo como `<ID_MATERIA>`.

### Actualizar la materia

- **Método:** PUT
- **URL:** `http://localhost:3000/api/materias/<ID_MATERIA>`
- **Body:** reemplazá `<ID_MATERIA>` por el número real.

```json
{
  "id": "<ID_MATERIA>",
  "nombre": "Materia helper actualizada"
}
```

- **Esperado:** 200 y body `1`.

### Error por ids distintos

- **Método:** PUT
- **URL:** `http://localhost:3000/api/materias/<ID_MATERIA>`
- **Body:**

```json
{
  "id": 999998,
  "nombre": "No debe actualizarse"
}
```

- **Esperado:** 400.

### Borrar la materia de prueba

- **Método:** DELETE
- **URL:** `http://localhost:3000/api/materias/<ID_MATERIA>`
- **Esperado:** 200 y body `null`.

### Confirmar el borrado

- **Método:** GET
- **URL:** `http://localhost:3000/api/materias/<ID_MATERIA>`
- **Esperado:** 404.

---

## Resultado que confirma el ejercicio

El ejercicio está bien si:

- los casos válidos continúan devolviendo 200 o 201;
- los ids inexistentes devuelven 404;
- los cuerpos inválidos y los ids distintos devuelven 400;
- las respuestas siguen siendo JSON o texto según se indica arriba;
- los alumnos continúan incluyendo una edad numérica;
- después de borrar los tres registros de prueba, no quedan datos extra creados por estas pruebas.
