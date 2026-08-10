import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import AlumnosService from '../../src/services/alumnos-service.js';

function crearRepo({ alumnos = [], createdId = 42, rowsAffected = 1 } = {}) {
    return {
        llamadas: { create: 0, update: 0 },
        getAllAsync: async () => alumnos,
        getByIdAsync: async id => alumnos.find(alumno => alumno.id === id) ?? null,
        createAsync: async function () { this.llamadas.create++; return createdId; },
        updateAsync: async function () { this.llamadas.update++; return rowsAffected; },
        deleteByIdAsync: async () => rowsAffected
    };
}

function crearCursosService(ids = []) {
    return { getByIdAsync: async id => ids.includes(id) ? { id } : null };
}

const alumnoValido = {
    nombre: 'Ana', apellido: 'Pérez', id_curso: 1,
    fecha_nacimiento: '2000-01-10', hace_deportes: true
};

describe('AlumnosService', () => {
    test('crea cuando los datos son válidos y el curso existe', async () => {
        const repo = crearRepo({ createdId: 42 });
        const service = new AlumnosService(repo, crearCursosService([1]));

        assert.equal(await service.createAsync(alumnoValido), 42);
        assert.equal(repo.llamadas.create, 1);
    });

    test('curso inexistente rechaza antes de escribir en el repository', async () => {
        const repo = crearRepo();
        const service = new AlumnosService(repo, crearCursosService());

        await assert.rejects(() => service.createAsync(alumnoValido), /curso con id 1 no existe/);
        assert.equal(repo.llamadas.create, 0);
    });

    test('datos inválidos rechazan antes de consultar dependencias', async () => {
        const repo = crearRepo();
        let consultasCurso = 0;
        const cursos = { getByIdAsync: async () => { consultasCurso++; return { id: 1 }; } };
        const service = new AlumnosService(repo, cursos);

        await assert.rejects(() => service.createAsync({ ...alumnoValido, nombre: '' }), /nombre.*obligatorio/);
        assert.equal(consultasCurso, 0);
        assert.equal(repo.llamadas.create, 0);
    });

    test('getById agrega edad y conserva null para un alumno inexistente', async () => {
        const repo = crearRepo({ alumnos: [{ id: 1, ...alumnoValido }] });
        const service = new AlumnosService(repo, crearCursosService());

        const alumno = await service.getByIdAsync(1);
        assert.equal(typeof alumno.edad, 'number');
        assert.ok(alumno.edad >= 26);
        assert.equal(await service.getByIdAsync(999), null);
    });

    test('update sin id_curso no consulta cursos y delega al repository', async () => {
        const repo = crearRepo({ rowsAffected: 1 });
        let consultasCurso = 0;
        const cursos = { getByIdAsync: async () => { consultasCurso++; return null; } };
        const service = new AlumnosService(repo, cursos);

        assert.equal(await service.updateAsync({ id: 1, nombre: 'Ana María' }), 1);
        assert.equal(consultasCurso, 0);
        assert.equal(repo.llamadas.update, 1);
    });
});
