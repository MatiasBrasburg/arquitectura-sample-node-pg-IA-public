import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { agregarEdad, calcularEdad } from '../../src/helpers/fechas-helper.js';

const HOY = '2026-08-03';

describe('calcularEdad', () => {
    test('calcula los casos típicos y el borde del cumpleaños', () => {
        assert.equal(calcularEdad('2006-08-02', HOY), 20);
        assert.equal(calcularEdad('2006-08-03', HOY), 20);
        assert.equal(calcularEdad('2006-08-04', HOY), 19);
    });

    test('acepta una fecha bisiesta real', () => {
        assert.equal(calcularEdad('2004-02-29', HOY), 22);
    });

    test('devuelve null para valores vacíos, inválidos, imposibles o futuros', () => {
        for (const valor of [null, undefined, '', 'mandarina', '2026-02-31', '2027-01-01']) {
            assert.equal(calcularEdad(valor, HOY), null);
        }
    });

    test('devuelve null cuando la fecha actual es inválida', () => {
        assert.equal(calcularEdad('2000-01-01', 'hoy-invalido'), null);
    });
});

describe('agregarEdad', () => {
    test('agrega la edad sin modificar el objeto original', () => {
        const alumno = { id: 1, nombre: 'Ana', fecha_nacimiento: '2006-08-03' };
        const resultado = agregarEdad(alumno, HOY);

        assert.deepEqual(resultado, { ...alumno, edad: 20 });
        assert.notEqual(resultado, alumno);
        assert.equal(Object.hasOwn(alumno, 'edad'), false);
    });

    test('conserva null y undefined', () => {
        assert.equal(agregarEdad(null, HOY), null);
        assert.equal(agregarEdad(undefined, HOY), undefined);
    });
});
