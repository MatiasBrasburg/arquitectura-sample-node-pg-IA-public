 PROMT EJ 1 
 rol: desarollador backen senior con muchisma expereicnai en node, js y sql con postgres en pg admin
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
