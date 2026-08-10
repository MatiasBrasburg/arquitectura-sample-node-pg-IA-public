import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import {
    parsearId,
    validarAlumno,
    validarCalificacion,
    validarEntidadConNombre,
    validarIdBody
} from '../../src/helpers/validaciones-helper.js';

describe('parsearId', () => {
    test('acepta enteros positivos y espacios alrededor', () => {
        assert.equal(parsearId(' 42 '), 42);
        assert.equal(parsearId(1), 1);
    });

    test('rechaza límites e inválidos', () => {
        for (const valor of [0, -1, 1.5, '', '1x', null, Number.MAX_SAFE_INTEGER + 1]) {
            assert.throws(() => parsearId(valor), /entero positivo/);
        }
    });
});

describe('validarIdBody', () => {
    test('acepta body sin id o con el mismo id', () => {
        assert.doesNotThrow(() => validarIdBody({}, 2));
        assert.doesNotThrow(() => validarIdBody({ id: '2' }, 2));
    });

    test('rechaza body no-objeto e ids diferentes', () => {
        assert.throws(() => validarIdBody(null, 2), /objeto JSON/);
        assert.throws(() => validarIdBody({ id: 3 }, 2), /no coincide/);
    });
});

describe('validarAlumno', () => {
    const valido = {
        nombre: 'Ana', apellido: 'Pérez', id_curso: 1,
        fecha_nacimiento: '2006-08-03', hace_deportes: false
    };

    test('acepta un alumno completo y una actualización parcial', () => {
        assert.doesNotThrow(() => validarAlumno(valido));
        assert.doesNotThrow(() => validarAlumno({ nombre: 'Nuevo' }, { parcial: true }));
    });

    test('rechaza campos faltantes, vacíos y tipos incorrectos', () => {
        assert.throws(() => validarAlumno({ ...valido, apellido: undefined }), /apellido.*obligatorio/);
        assert.throws(() => validarAlumno({ ...valido, id_curso: 0 }), /entero positivo/);
        assert.throws(() => validarAlumno({ ...valido, hace_deportes: 'sí' }), /booleano/);
        assert.throws(() => validarAlumno({}, { parcial: true }), /al menos un campo/);
    });

    test('rechaza fechas con formato incorrecto, imposibles o futuras', () => {
        assert.throws(() => validarAlumno({ ...valido, fecha_nacimiento: '03/08/2006' }), /YYYY-MM-DD/);
        assert.throws(() => validarAlumno({ ...valido, fecha_nacimiento: '2026-02-31' }), /fecha inv.lida/);
        assert.throws(() => validarAlumno({ ...valido, fecha_nacimiento: '2999-01-01' }), /futuro/);
    });
});

describe('validarEntidadConNombre', () => {
    test('acepta un nombre y rechaza vacío o mayor a 75 caracteres', () => {
        assert.doesNotThrow(() => validarEntidadConNombre({ nombre: 'Matemática' }, 'materia'));
        assert.throws(() => validarEntidadConNombre({ nombre: '   ' }, 'materia'), /obligatorio/);
        assert.throws(() => validarEntidadConNombre({ nombre: 'a'.repeat(76) }, 'materia'), /75 caracteres/);
    });
});

describe('validarCalificacion', () => {
    const base = { id_alumno: 1, id_materia: 2, nota: 4 };

    test('acepta mínimo, máximo y actualización parcial', () => {
        assert.doesNotThrow(() => validarCalificacion({ ...base, nota: 0 }));
        assert.doesNotThrow(() => validarCalificacion({ ...base, nota: 10 }));
        assert.doesNotThrow(() => validarCalificacion({ nota: 4 }, { parcial: true }));
    });

    test('rechaza justo fuera del rango, decimales y tipos incorrectos', () => {
        for (const nota of [-1, 11, 4.5, '8', NaN]) {
            assert.throws(() => validarCalificacion({ ...base, nota }), /entre 0 y 10/);
        }
        assert.throws(() => validarCalificacion({ ...base, id_alumno: 0 }), /entero positivo/);
        assert.throws(() => validarCalificacion({}, { parcial: true }), /al menos un campo/);
    });
});
