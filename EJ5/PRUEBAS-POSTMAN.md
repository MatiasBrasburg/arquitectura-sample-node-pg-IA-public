# Pruebas del ejercicio 5 en Postman

## Preparación

1. Levantá la API con `npm run server`.
2. Verificá que `.env` tenga `AUTH_USERNAME`, `AUTH_PASSWORD`, `JWT_SECRET` y `JWT_EXPIRES_IN`.
3. Usá `http://localhost:3000` como base.

## 1. Login

Hacé `POST /api/auth/login` con Body > raw > JSON:

```json
{
  "usuario": "<AUTH_USERNAME>",
  "clave": "<AUTH_PASSWORD>"
}
```

Con los valores correctos esperá `200` y un objeto con `token`. Con una clave incorrecta esperá `401` y `Credenciales incorrectas.`.

Guardá el token en una variable de Postman llamada `token`. No copies la clave ni `JWT_SECRET` en capturas o archivos versionados.

## 2. Escrituras protegidas

- `DELETE /api/alumnos/999999` sin Authorization → `401`.
- La misma request con `Authorization: Token abc` → `401` por formato incorrecto.
- La misma request con `Authorization: Bearer token-falso` → `401` por token inválido.
- La misma request con `Authorization: Bearer {{token}}` → atraviesa autenticación y devuelve la respuesta normal del endpoint (`404` para ese id inexistente).

Repetí una creación válida con `POST /api/cursos`, `POST /api/materias` o `POST /api/alumnos`: sin token debe dar `401`; con token debe ejecutar la validación y operación normal.

## 3. Lecturas públicas

`GET /api/alumnos`, `GET /api/cursos`, `GET /api/materias` y `GET /api/calificaciones` no requieren token. La decisión del ejercicio fue mantener públicas las lecturas y proteger todo cambio de estado.

`GET /api/alumnos/test-insert` sí exige token porque, pese al verbo GET heredado del proyecto, crea un registro.

## 4. Token vencido o alterado

- Cambiá una letra del token y enviá una escritura → `401` y `El token es inválido.`. La firma ya no coincide.
- Para probar expiración, configurá temporalmente `JWT_EXPIRES_IN="1s"`, reiniciá el servidor, iniciá sesión, esperá más de un segundo y enviá una escritura → `401` y `El token está vencido.`. Después restaurá `1h`.

## Capturas recomendadas

1. Login correcto → 200 con token parcialmente oculto.
2. Login incorrecto → 401.
3. DELETE sin header → 401.
4. DELETE con token alterado → 401.
5. DELETE de id inexistente con token válido → 404, demostrando que pasó el middleware.
6. GET público → 200.
