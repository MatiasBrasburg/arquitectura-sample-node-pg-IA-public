# Pruebas del ejercicio 4 en Postman

## Preparación

1. Ejecutá `npm install` si todavía no instalaste las dependencias.
2. Levantá la API con `npm run server`.
3. Usá `http://localhost:3000` como base.
4. En POST y PUT seleccioná **Body > raw > JSON** y el header `Content-Type: application/json`.

> Importante: los datos de POST y PUT van en **Body**, no en la pestaña Params. El método también debe coincidir con el indicado.

---

## 1. Pruebas obligatorias de alumnos

### Body vacío

- **Método:** POST
- **URL:** `http://localhost:3000/api/alumnos`
- **Body:** `{}`
- **Esperado:** 400 y `El campo nombre es obligatorio.`

### Id no numérico

- **Método:** GET
- **URL:** `http://localhost:3000/api/alumnos/abc`
- **Body:** ninguno
- **Esperado:** 400 y `El id debe ser un número entero positivo.`

Repetí también con:

- `GET http://localhost:3000/api/alumnos/1.5` → 400
- `DELETE http://localhost:3000/api/alumnos/0` → 400
- `PUT http://localhost:3000/api/alumnos/-2` con cualquier JSON → 400

### Tipos incorrectos

- **Método:** POST
- **URL:** `http://localhost:3000/api/alumnos`
- **Body:**

```json
{
  "nombre": "Alumno",
  "apellido": "Invalido",
  "id_curso": "hola",
  "fecha_nacimiento": "2008-01-01",
  "hace_deportes": true
}
```

- **Esperado:** 400 indicando que `id_curso` debe ser un entero positivo.

### Fecha imposible

- **Método:** POST
- **URL:** `http://localhost:3000/api/alumnos`
- **Body:**

```json
{
  "nombre": "Alumno",
  "apellido": "Fecha",
  "id_curso": 1,
  "fecha_nacimiento": "2025-02-30",
  "hace_deportes": false
}
```

- **Esperado:** 400 indicando que la fecha es inválida.

### Curso inexistente

- **Método:** POST
- **URL:** `http://localhost:3000/api/alumnos`
- **Body:**

```json
{
  "nombre": "Alumno",
  "apellido": "Sin curso",
  "id_curso": 999999,
  "fecha_nacimiento": "2008-01-01",
  "hace_deportes": false
}
```

- **Esperado:** 400 y `El curso con id 999999 no existe.`

### Alumno válido

- **Método:** POST
- **URL:** `http://localhost:3000/api/alumnos`
- **Body:**

```json
{
  "nombre": "Prueba",
  "apellido": "Validacion",
  "id_curso": 1,
  "fecha_nacimiento": "2008-08-27",
  "hace_deportes": true
}
```

- **Esperado:** 201 y un id numérico. Guardalo y borrá el alumno al terminar con `DELETE /api/alumnos/<ID>`.

---

## 2. Consistencia en cursos y materias

### Curso sin nombre

- **Método:** POST
- **URL:** `http://localhost:3000/api/cursos`
- **Body:** `{}`
- **Esperado:** 400.

### Materia con nombre vacío

- **Método:** POST
- **URL:** `http://localhost:3000/api/materias`
- **Body:**

```json
{
  "nombre": ""
}
```

- **Esperado:** 400.

### Ids distintos en PUT

- **Método:** PUT
- **URL:** `http://localhost:3000/api/cursos/1`
- **Body:**

```json
{
  "id": 2,
  "nombre": "No se modifica"
}
```

- **Esperado:** 400 y mensaje indicando que los ids no coinciden.

### Id inválido en otras entidades

- `GET http://localhost:3000/api/cursos/abc` → 400
- `DELETE http://localhost:3000/api/materias/abc` → 400

---

## 3. Calificaciones

Primero ejecutá:

- `GET http://localhost:3000/api/alumnos`
- `GET http://localhost:3000/api/materias`

Elegí un id real de cada respuesta. En los ejemplos siguientes reemplazá `<ALUMNO>` y `<MATERIA>` por esos números.

### Listar calificaciones

- **Método:** GET
- **URL:** `http://localhost:3000/api/calificaciones`
- **Esperado:** 200 y un array JSON.

### Nota fuera de rango

- **Método:** POST
- **URL:** `http://localhost:3000/api/calificaciones`
- **Body:**

```json
{
  "id_alumno": 1,
  "id_materia": 3,
  "nota": 99
}
```

- **Esperado:** 400 y mensaje indicando que la nota debe estar entre 0 y 10. Esta prueba ocurre antes de consultar las FKs.

### Nota con tipo incorrecto

- **Método:** POST
- **URL:** `http://localhost:3000/api/calificaciones`
- **Body:**

```json
{
  "id_alumno": 1,
  "id_materia": 3,
  "nota": "diez"
}
```

- **Esperado:** 400.

### Alumno inexistente

- **Método:** POST
- **URL:** `http://localhost:3000/api/calificaciones`
- **Body:** usá un id real de materia.

```json
{
  "id_alumno": 999999,
  "id_materia": 3,
  "nota": 7
}
```

- **Esperado:** 400 y `El alumno con id 999999 no existe.`

### Crear una calificación válida

- **Método:** POST
- **URL:** `http://localhost:3000/api/calificaciones`
- **Body:** reemplazá los ids por valores existentes.

```json
{
  "id_alumno": 1,
  "id_materia": 3,
  "nota": 8
}
```

- **Esperado:** 201 y un id numérico. Guardalo como `<ID_CALIFICACION>`.

### Probar conflicto duplicado

- **Método:** POST
- **URL:** `http://localhost:3000/api/calificaciones`
- **Body:** repetí exactamente el mismo `id_alumno` e `id_materia`; la nota puede cambiar.

```json
{
  "id_alumno": 1,
  "id_materia": 3,
  "nota": 9
}
```

- **Esperado:** 409 y `El alumno ya tiene una calificación para esa materia.`

### Consultar la calificación

- **Método:** GET
- **URL:** `http://localhost:3000/api/calificaciones/<ID_CALIFICACION>`
- **Esperado:** 200 con id, alumno, materia, nota y fecha.

### Actualizar solamente la nota

- **Método:** PUT
- **URL:** `http://localhost:3000/api/calificaciones/<ID_CALIFICACION>`
- **Body:** reemplazá el id.

```json
{
  "id": 1,
  "nota": 10
}
```

- **Esperado:** 200 y body `1`.

### Borrar y confirmar

1. `DELETE http://localhost:3000/api/calificaciones/<ID_CALIFICACION>` → 200 y `null`.
2. `GET http://localhost:3000/api/calificaciones/<ID_CALIFICACION>` → 404.

---

## Capturas recomendadas para entregar

Sacá al menos estas capturas mostrando método, URL, body, status y respuesta:

1. POST alumnos con `{}` → 400.
2. GET alumnos/abc → 400.
3. POST alumno con curso inexistente → 400.
4. POST calificaciones con nota 99 → 400.
5. POST calificación válida → 201.
6. POST de la misma combinación → 409.
7. GET de la calificación creada → 200.
8. DELETE y GET posterior → 200 y 404.

No uses query params para simular el body. En Postman, una captura de `GET /api/materias?nombre=""` no prueba la validación del POST, y `GET /api/cursos/1?id=2` no prueba la comparación del PUT.
