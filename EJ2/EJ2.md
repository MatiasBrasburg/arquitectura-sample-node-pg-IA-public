# 📓 Bitácora de Prompts — Ejercicio N.º 2

## Datos

- **Alumnos:** Matias Brasburg y Tobias Rohr
- **Ejercicio:** N.º 2 — Refactorización del CRUD repetido
- **Fecha:** 06/07/2026
- **Modelo de IA usado:** ChatGPT / Codex

---

## 1. 🎯 Qué me pidieron

El objetivo era detectar el código repetido entre los repositories de alumnos, cursos y materias, y refactorizarlo sin cambiar el funcionamiento de la API. Había que elegir y justificar una estrategia, mantener el uso de `pg` y comprobar que las reglas particulares de cada entidad siguieran funcionando.

---

## 2. 💬 Mis prompts (en orden)

### Prompt #1 — Diagnóstico

**Lo que escribí:**

```text
Actuá como un desarrollador backend senior con experiencia en Node.js,
JavaScript y PostgreSQL.

Estoy trabajando en este proyecto por capas. Compará los repositories de
alumnos, cursos y materias. Los tres repiten getAllAsync, getByIdAsync y
deleteByIdAsync, mientras que createAsync y updateAsync cambian según las
columnas y reglas de cada entidad.

Todavía no modifiques el código. Identificá exactamente la duplicación y
proponeme entre dos y tres estrategias para eliminarla. Explicá las ventajas,
desventajas y cuál elegirías para este proyecto. No propongas un ORM ni
cambies pg, DbPg, los services, los controllers o la API pública.
```

**Auto-chequeo de las 5 partes EFSI:**

- [x] Rol
- [x] Contexto
- [x] Tarea
- [x] Restricciones
- [x] Iteración

**Qué me devolvió (resumen):**

La IA encontró que los tres repositories repetían la creación de `DbPg` y los métodos de consulta por tabla e id. Propuso tres opciones:

1. Una clase `BaseRepository` por herencia, parametrizada con el nombre de tabla.
2. Un `GenericRepository` usado por composición y delegación.
3. Funciones helper que recibieran `db` y el nombre de la tabla.

Recomendó herencia porque el proyecto ya usa clases, los tres repositories comparten el mismo contrato y solo era necesario heredar tres operaciones. Aclaró que `createAsync` y `updateAsync` debían continuar en cada clase hija porque dependen de columnas y reglas distintas.

**¿Me sirvió tal cual, o tuve que corregir/repreguntar?**

Me sirvió para elegir una dirección, pero no apliqué código todavía. Elegí la estrategia de herencia porque era la más corta y consistente con el estilo del proyecto. Descarté composición porque obligaba a repetir métodos que solo delegaban, y descarté helpers porque mezclaban el enfoque funcional con una estructura basada en clases.

### Prompt #2 — Ejecución

**Lo que escribí:**

```text
Implementá la opción de herencia que propusiste.

Creá src/repositories/base-repository.js con una clase BaseRepository que
reciba tableName y repositoryName. Extraé solamente getAllAsync,
getByIdAsync y deleteByIdAsync. Hacé que AlumnosRepository,
CursosRepository y MateriasRepository extiendan esa clase y pasen valores
constantes a super().

Restricciones:
- mantené los métodos como arrow functions, igual que el proyecto;
- seguí usando DbPg y SQL crudo con pg;
- usá $1 para el id y nunca concatenes datos del usuario;
- no cambies createAsync ni updateAsync;
- no cambies services, controllers, rutas, status codes ni respuestas JSON;
- no agregues dependencias ni un ORM;
- conservá los logs actuales;
- verificá sintaxis y explicá qué duplicación se eliminó.
```

**Por qué necesité este segundo prompt:**

El primer prompt era solamente de diagnóstico. Después de comparar las alternativas y elegir herencia, este segundo prompt definió con precisión qué debía implementarse y qué partes no se podían modificar.

**Qué me devolvió (resumen):**

La IA creó `BaseRepository`, que instancia `DbPg` una sola vez por repository y contiene las consultas comunes. Luego cambió los tres repositories para que usaran `extends BaseRepository` y configuraran la tabla y el nombre del log con `super(...)`.

Los métodos específicos `createAsync` y `updateAsync` quedaron en cada repository. El cambio eliminó 60 líneas repetidas y agregó 36 líneas, con una reducción neta de 24 líneas. No se modificaron los services, controllers, endpoints ni `package.json`.

**¿Me sirvió tal cual, o tuve que corregir/repreguntar?**

Revisé que la tabla recibida por la clase base no proviniera del usuario, que los ids continuaran usando `$1` y que la lógica particular de alumnos siguiera presente. También comprobé que no intentara generalizar los INSERT y UPDATE, porque eso hubiera ocultado las diferencias entre entidades.

---

## 3. 🔧 Qué hizo la IA y qué hice yo

| Archivo / función | Lo generó la IA | Lo modifiqué o verifiqué yo | Por qué |
|---|---|---|---|
| `src/repositories/base-repository.js` | Propuso y generó la clase base con los tres métodos comunes. | Revisé el uso de `DbPg`, `$1` y que `tableName` fuera una constante interna. | Para evitar duplicación sin introducir SQL injection. |
| `alumnos-repository.js` | Agregó `extends BaseRepository` y `super('alumnos', ...)`. | Verifiqué que `createAsync`, `updateAsync` y la actualización parcial no cambiaran. | Alumnos tiene campos y comportamiento propios. |
| `cursos-repository.js` | Reemplazó los métodos repetidos por herencia. | Comprobé que INSERT y UPDATE conservaran sus queries y valores. | La refactorización no debía modificar el contrato. |
| `materias-repository.js` | Reemplazó los métodos repetidos por herencia. | Comprobé que la actualización parcial siguiera consultando el registro anterior. | Era una diferencia específica que no convenía generalizar. |
| Verificación | Sugirió los casos a probar. | Revisé el diff, la sintaxis, las dependencias y las colecciones de Postman. | La decisión final y la validación del resultado eran responsabilidad nuestra. |

---

## 4. 🐛 Errores o cosas mal que detecté en la respuesta de la IA

En la primera propuesta, la IA consideró hacer también genéricos `createAsync` y `updateAsync`. No lo acepté porque alumnos tiene más columnas y conserva valores anteriores al actualizar, mientras que cursos y materias tienen estructuras distintas. Generalizar esos métodos requería pasar listas de columnas o configuraciones adicionales y hacía el código más difícil de entender.

También tuve que revisar la interpolación de `${this.tableName}`. Es segura en este caso porque el nombre se define como una constante dentro de cada constructor (`alumnos`, `cursos` o `materias`) y nunca llega desde una request. En cambio, los ids continúan enviándose como parámetros con `$1`.

---

## 5. ✅ Verificación

- [x] Los endpoints de alumnos, cursos y materias mantienen las mismas rutas, controllers, status codes y respuestas JSON. Los controllers y services no fueron modificados por el commit del refactor.
- [x] La lógica común está en un solo lugar: `getAllAsync`, `getByIdAsync` y `deleteByIdAsync` se encuentran en `base-repository.js`.
- [x] Lo específico sigue claro: cada repository conserva su propio `createAsync` y `updateAsync`.
- [x] La regla particular de alumnos no se perdió: su INSERT, su UPDATE parcial y las validaciones del service permanecieron sin cambios.
- [x] Los ids siguen usando placeholders (`$1`) y no se concatena input del usuario en el SQL.
- [x] No se agregó un ORM ni dependencias nuevas; `package.json` no fue modificado.
- [x] `node --check` finalizó sin errores para la clase base y los tres repositories.
- [x] Se conservaron las colecciones de Postman de alumnos/cursos y materias dentro de `documents/postman`.

**Evidencia del cambio:** el commit `bf923a9` agregó `base-repository.js`, eliminó 60 líneas repetidas y agregó 36. El diff no presenta cambios en controllers, services ni dependencias.

---

## 6. ✍️ Reflexión

Para resolver el ejercicio primero comparamos los repositories de alumnos, cursos y materias. A simple vista parecían archivos diferentes porque cada uno trabaja con otra tabla, pero al mirar los métodos vimos que `getAllAsync`, `getByIdAsync` y `deleteByIdAsync` tenían exactamente la misma estructura. Solo cambiaban el nombre usado en el log y el nombre de la tabla. En cambio, los INSERT y UPDATE sí eran distintos, porque cada entidad tiene sus propias columnas y en algunos casos conserva valores anteriores.

Antes de pedir una modificación usamos la IA para comparar alternativas. Consideramos herencia, composición y helpers. Elegimos herencia con `BaseRepository` porque el proyecto ya estaba organizado con clases y porque permite que cada repository reciba los tres métodos comunes sin escribir funciones de delegación. La composición también era válida y da más flexibilidad, pero en este caso agregaba código intermedio sin una ventaja clara. Los helpers eran simples, aunque quedaban menos integrados con el diseño actual.

La decisión más importante fue limitar el alcance del refactor. La IA llegó a sugerir una configuración genérica para INSERT y UPDATE, pero no la usamos. Hacer eso hubiera reducido algunas líneas más a cambio de esconder las columnas y las reglas particulares de cada entidad. Preferimos que `createAsync` y `updateAsync` siguieran visibles en sus repositories. Así, el código común está centralizado, pero lo específico continúa siendo fácil de leer y modificar.

También aprendimos la diferencia entre interpolar una constante controlada por el desarrollador y concatenar datos enviados por el usuario. La clase base necesita interpolar `tableName` porque PostgreSQL no permite usar un placeholder para el nombre de una tabla. Esto no abre una inyección SQL porque los únicos valores posibles se escriben en los constructores. Los ids, que sí pueden venir de una request, continúan usando `$1`.

Finalmente verificamos que el cambio fuera realmente una refactorización y no una reescritura: no se tocaron controllers, services, endpoints ni dependencias, y los métodos comunes quedaron en un solo archivo. El resultado redujo 24 líneas netas y, más importante, evita que una corrección futura de esas consultas tenga que repetirse en tres lugares. Si mañana agregamos `profesores`, solo deberíamos extender `BaseRepository`, indicar su tabla y escribir sus operaciones específicas.

---

## 7. 🔗 Adjuntos

- [ ] Link o PDF de la conversación completa con la IA
- [x] Commit en GitHub: `bf923a9` (`listo el 2`)
- [x] Colecciones de verificación: `documents/postman/DAI - PG - Alumnos-cursos.postman_collection.json` y `documents/postman/DAI - PG - Materias.postman_collection.json`
