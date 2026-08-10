import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import CalificacionesService from '../../src/services/calificaciones-service.js';

function crearRepo({
    existente = null,
    anterior = null,
    createdId = 7,
    rowsAffected = 1,
    errorCreate = null,
    errorUpdate = null
} = {}) {
    return {
        llamadasCreate: 0,
        llamadasUpdate: 0,
        consultaDuplicado: null,
        entidadActualizada: null,
        getByIdAsync: async () => anterior,
        getByAlumnoMateriaAsync: async function (idAlumno, idMateria, idExcluir) {
            this.consultaDuplicado = { idAlumno, idMateria, idExcluir };
            return existente;
        },
        createAsync: async function () {
            this.llamadasCreate++;
            if (errorCreate) throw errorCreate;
            return createdId;
        },
        updateAsync: async function (entity) {
            this.llamadasUpdate++;
            this.entidadActualizada = entity;
            if (errorUpdate) throw errorUpdate;
            return rowsAffected;
        }
    };
}

const entidad = { id_alumno: 1, id_materia: 2, nota: 4 };
const existe = id => ({ getByIdAsync: async recibido => recibido === id ? { id } : null });

describe('CalificacionesService.createAsync', () => {
    test('crea cuando las referencias existen y no hay duplicado', async () => {
        const repo = crearRepo({ createdId: 7 });
        const service = new CalificacionesService(repo, existe(1), existe(2));

        assert.equal(await service.createAsync(entidad), 7);
        assert.equal(repo.llamadasCreate, 1);
    });

    test('rechaza alumno o materia inexistente antes de crear', async () => {
        const repoAlumno = crearRepo();
        const sinAlumno = new CalificacionesService(repoAlumno, existe(999), existe(2));
        await assert.rejects(() => sinAlumno.createAsync(entidad), /alumno con id 1 no existe/);
        assert.equal(repoAlumno.llamadasCreate, 0);

        const repoMateria = crearRepo();
        const sinMateria = new CalificacionesService(repoMateria, existe(1), existe(999));
        await assert.rejects(() => sinMateria.createAsync(entidad), /materia con id 2 no existe/);
        assert.equal(repoMateria.llamadasCreate, 0);
    });

    test('rechaza una calificación duplicada sin crear', async () => {
        const repo = crearRepo({ existente: { id: 10 } });
        const service = new CalificacionesService(repo, existe(1), existe(2));

        await assert.rejects(() => service.createAsync(entidad), /ya tiene una calificaci.n/);
        assert.equal(repo.llamadasCreate, 0);
    });

    test('traduce la restricción única de PostgreSQL a error de conflicto', async () => {
        const repo = crearRepo({ errorCreate: { code: '23505' } });
        const service = new CalificacionesService(repo, existe(1), existe(2));

        await assert.rejects(
            () => service.createAsync(entidad),
            error => error.statusCode === 409 && /ya tiene una calificaci.n/.test(error.message)
        );
    });
});

describe('CalificacionesService.updateAsync', () => {
    const anterior = { id: 5, id_alumno: 1, id_materia: 2, nota: 6, fecha: '2026-08-01' };

    test('combina el cambio parcial, valida referencias y actualiza', async () => {
        const repo = crearRepo({ anterior, rowsAffected: 1 });
        const service = new CalificacionesService(repo, existe(1), existe(2));

        assert.equal(await service.updateAsync({ id: 5, nota: 9 }), 1);
        assert.deepEqual(repo.entidadActualizada, { ...anterior, nota: 9 });
        assert.deepEqual(repo.consultaDuplicado, { idAlumno: 1, idMateria: 2, idExcluir: 5 });
    });

    test('devuelve 0 si la calificación no existe y no intenta actualizar', async () => {
        const repo = crearRepo({ anterior: null });
        const service = new CalificacionesService(repo, existe(1), existe(2));

        assert.equal(await service.updateAsync({ id: 999, nota: 8 }), 0);
        assert.equal(repo.llamadasUpdate, 0);
    });

    test('rechaza si el cambio genera un duplicado', async () => {
        const repo = crearRepo({ anterior, existente: { id: 8 } });
        const service = new CalificacionesService(repo, existe(1), existe(2));

        await assert.rejects(() => service.updateAsync({ id: 5, nota: 8 }), /ya tiene una calificaci.n/);
        assert.equal(repo.llamadasUpdate, 0);
    });

    test('traduce el error 23505 del update a conflicto HTTP 409', async () => {
        const repo = crearRepo({ anterior, errorUpdate: { code: '23505' } });
        const service = new CalificacionesService(repo, existe(1), existe(2));

        await assert.rejects(
            () => service.updateAsync({ id: 5, nota: 8 }),
            error => error.statusCode === 409 && /ya tiene una calificaci.n/.test(error.message)
        );
    });
});
