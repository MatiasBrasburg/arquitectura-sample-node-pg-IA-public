# 📓 Bitácora de Prompts — Ejercicio N° ___

> Copiá este archivo por cada ejercicio que entregues. Nombralo, por ejemplo, `entregas/01-bitacora.md`.
> Esta bitácora **es parte de la nota**. Un ejercicio sin bitácora no se corrige.

---

## Datos

- **Alumno/a:** _Matias Brasburg, Tobias Rohr__
- **Ejercicio:** N° __1_ — ___________________

- **Modelo de IA usado:** (ej: ChatGPT, Claude, Gemini, Copilot) 

chatgpt /codex 
## 1. 🎯 Qué me pidieron

Resumí en 2–3 líneas el objetivo del ejercicio con tus palabras (no copiado del enunciado).

hacer un crud implementando 2 tablas y a una de las tablas agregarle datos 

## 2. 💬 Mis prompts (en orden)

Pegá **todos** los prompts que usaste, en orden, con la respuesta resumida y qué hiciste con ella. Agregá tantos como necesites.

### Prompt #1

**Lo que escribí:**
 rol: desarollador backen senior con muchisma expereicnai en node, js y sql con postgres en pg adminG
   contexto C:\Users\devandroid\arquitectura-sample-node-pg-IA-public

   mira tengo este proyecto, quiero que me crees uayabla con esto: CREATE TABLE materias (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(75) NOT NULL
  );

  -- Tabla calificaciones
  -- Cada alumno tiene UNA sola calificación por materia (no se repite la combinación alumno+materia).
  CREATE TABLE calificaciones (
      id SERIAL PRIMARY KEY,
      id_alumno INT NOT NULL REFERENCES alumnos(id),
      fecha DATE NOT NULL DEFAULT CURRENT_DATE,
      UNIQUE(id_alumno, id_materia)
  );

  -- Datos de prueba para materias
  INSERT INTO materias (nombre) VALUES ('Matemática');
  INSERT INTO materias (nombre) VALUES ('Lengua');
  INSERT INTO materias (nombre) VALUES ('Historia');
  INSERT INTO materias (nombre) VALUES ('Programación');
  INSERT INTO materias (nombre) VALUES ('Base de Datos');

  dps verifica el resultado con estos parametros :  Verificación del resultado (¿la IA lo hizo bien?)
  Marcá cada ítem cuando lo verifiques vos (no la IA):

   El repository delega el acceso a datos en la clase DbPg (this.db.queryAll/queryOne/...), igual que
  alumnos-repository.js. No toca el Pool directamente ni crea un Client nuevo por request (de eso se encarga db-pg.js
  con lazy init).
   Las queries usan placeholders $1, $2... (no concatenación de strings → eso sería SQL injection, ver ejercicio 09).
   El controller devuelve los status codes correctos: 200, 201 en POST, 404 cuando no existe, 400 en error de input.
   El update valida que el id de la URL coincida con el del body (mirá cómo lo hace alumnos-controller.js en el PUT).
   El controller está registrado en server.js y los 5 endpoints responden en Postman.
   No aparecieron dependencias nuevas en package.json.


**Auto-chequeo de las 5 partes EFSI** (marcá lo que incluiste):
- [si] Rol
- [si] Contexto (¿pegaste código del proyecto?)
- [si] Tarea
- [ ] Restricciones
- [si] Iteración

**Qué me devolvió (resumen):**
• Implementé el CRUD para materias y calificaciones.

  Cambios principales:

  - SQL agregado en arquitectura-sample-node-pg-IA-public/documents/database/script-postgress.sql.
  - Nuevos endpoints registrados en arquitectura-sample-node-pg-IA-public/src/server.js:
      - /api/materias
      - /api/calificaciones

  - Agregué entities, repositories, services y controllers para ambas tablas.
  - Los repositories usan DbPg con this.db.queryAll/queryOne/queryReturnId/queryRowCount.
  - Las queries usan placeholders $1, $2, etc.
  - Los controllers devuelven 200, 201, 404 y 400 según corresponda.
  - El PUT valida que el id de la URL coincida con el id del body.
  - No modifiqué package.json.

  Verifiqué sintaxis con node --check en los módulos nuevos/tocados. No levanté el server ni probé contra Postman porque
  eso depende de tener la DB creada/cargada en PostgreSQL o pgAdmin.

**¿Me sirvió tal cual, o tuve que corregir/repreguntar?**
```
...
```

### Prompt #2

› actua como postman realizando consultas a cada endpoint para ver si lo que me pide en este ejercico esta y bien hecho

**Lo que escribí:**
```
...
```
**Por qué necesité este segundo prompt** (qué falló o faltó en el anterior):
para que actue como postman

*(Repetí la estructura para cada prompt. Si resolviste todo con un solo prompt gigante, ⚠️ eso es 🟡 según EFSI — explicá por qué.)*

 Request                                Status    Resultado
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ━━━━━━━━  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   GET /api/materias                         200    Devuelve las 5 materias cargadas
  ─────────────────────────────────────  ────────  ─────────────────────────────────────
   POST /api/materias                        201    Creó una materia de prueba, id 6
  ─────────────────────────────────────  ────────  ─────────────────────────────────────
   GET /api/materias/6                       200    Devuelve la materia creada
  ─────────────────────────────────────  ────────  ─────────────────────────────────────
   PUT /api/materias/6                       200    Actualizó, devuelve 1 fila afectada
  ─────────────────────────────────────  ────────  ─────────────────────────────────────
   DELETE /api/materias/6                    200    Eliminó correctamente
  ─────────────────────────────────────  ────────  ─────────────────────────────────────
   GET /api/materias/6 luego de borrar       404    Correcto
  ─────────────────────────────────────  ────────  ─────────────────────────────────────
   POST /api/materias con nombre: ""         400    Correcto
  ─────────────────────────────────────  ────────  ─────────────────────────────────────
   PUT /api/materias/1 con body id: 2        400    Correcto

  También ejecuté el SQL en la DB configurada y quedaron creadas:

  - materias
  - calificaciones

  Y se cargaron:

  - Matematica
  - Lengua
  - Historia
  - Programacion
  - Base de Datos

  Dejé exportada la collection acá: arquitectura-sample-node-pg-IA-public/documents/postman/DAI - PG -
  Materias.postman_collection.json

  Checklist:

  - Repository usa DbPg: sí.
  - Queries con $1, $2: sí.
  - Status codes correctos: sí.
  - PUT valida id URL vs body: sí.
  - Controller registrado en server.js: sí.
  - 5 endpoints responden: sí.
  - package.json sin dependencias nuevas: sí.

## 3. 🔧 Qué hizo la IA y qué hice yo

Marcá esto **también en el código** con comentarios `// [IA]` y `// [YO]`. Acá resumilo:

| Archivo / función | Lo generó la IA | Lo modifiqué/escribí yo | Por qué |
|---|---|---|---|
| | | | |
| | | | |

---

## 4. 🐛 Errores o cosas mal que detecté en la respuesta de la IA

> Si ponés "ninguno", probablemente no las viste. **Siempre** hay algo (un import de más, un estilo distinto, un caso borde olvidado, una mala práctica de seguridad).

hacia lo que queria

## 5. ✅ Verificación

Pegá el checklist de verificación del ejercicio y marcá lo que comprobaste **vos** (con qué evidencia: captura de Postman, salida de `npm test`, número de ms, etc.).
 Request                                Status    Resultado
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ━━━━━━━━  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   GET /api/materias                         200    Devuelve las 5 materias cargadas
  ─────────────────────────────────────  ────────  ─────────────────────────────────────
   POST /api/materias                        201    Creó una materia de prueba, id 6
  ─────────────────────────────────────  ────────  ─────────────────────────────────────
   GET /api/materias/6                       200    Devuelve la materia creada
  ─────────────────────────────────────  ────────  ─────────────────────────────────────
   PUT /api/materias/6                       200    Actualizó, devuelve 1 fila afectada
  ─────────────────────────────────────  ────────  ─────────────────────────────────────
   DELETE /api/materias/6                    200    Eliminó correctamente
  ─────────────────────────────────────  ────────  ─────────────────────────────────────
   GET /api/materias/6 luego de borrar       404    Correcto
  ─────────────────────────────────────  ────────  ─────────────────────────────────────
   POST /api/materias con nombre: ""         400    Correcto
  ─────────────────────────────────────  ────────  ─────────────────────────────────────
   PUT /api/materias/1 con body id: 2        400    Correcto

  También ejecuté el SQL en la DB configurada y quedaron creadas:

  - materias
  - calificaciones

  Y se cargaron:

  - Matematica
  - Lengua
  - Historia
  - Programacion
  - Base de Datos

  Dejé exportada la collection acá: arquitectura-sample-node-pg-IA-public/documents/postman/DAI - PG -
  Materias.postman_collection.json

  Checklist:

  - Repository usa DbPg: sí.
  - Queries con $1, $2: sí.
  - Status codes correctos: sí.
  - PUT valida id URL vs body: sí.
  - Controller registrado en server.js: sí.
  - 5 endpoints responden: sí.
  - package.json sin dependencias nuevas: sí.

## 6. ✍️ Reflexión (300–600 palabras)

Cubrí: qué proceso seguiste, qué decisiones tomaste y por qué, qué aprendiste, y —lo más importante— **qué corregiste de lo que te dio la IA**. Escribí con tus palabras; esto se contrasta con el oral.

```
...
```

---

## 7. 🔗 Adjuntos

- [ ] Link/PDF de la conversación completa con la IA
- [ ] Commit(s) en GitHub: `____________`
- [ ] Capturas / evidencias de verificación
