import test from 'node:test';
import assert from 'node:assert/strict';
import { agregarEdad, calcularEdad } from '../src/helpers/fechas-helper.js';

const fechaFija = '2026-08-03';

// [IA] Casos borde sugeridos: cumpleanos antes, hoy, despues, null e invalida.

test('calcularEdad devuelve la edad cuando el cumpleaños ya paso', () => {
    assert.equal(calcularEdad('2006-08-02', fechaFija), 20);
});

test('calcularEdad devuelve la edad cuando el cumpleaños es hoy', () => {
    assert.equal(calcularEdad('2006-08-03', fechaFija), 20);
});

test('calcularEdad resta un año cuando el cumpleaños todavia no llego', () => {
    assert.equal(calcularEdad('2006-08-04', fechaFija), 19);
});

test('calcularEdad devuelve null para null, fecha invalida o fecha futura', () => {
    assert.equal(calcularEdad(null, fechaFija), null);
    assert.equal(calcularEdad('fecha-invalida', fechaFija), null);
    assert.equal(calcularEdad('2026-02-31', fechaFija), null);
    assert.equal(calcularEdad('2027-01-01', fechaFija), null);
});

test('calcularEdad calcula bien una fecha de nacimiento en anio bisiesto', () => {
    // [YO] Agregue este caso porque no estaba en la primera lista de la IA.
    assert.equal(calcularEdad('2004-02-29', fechaFija), 22);
});

test('agregarEdad conserva el objeto y agrega edad calculada', () => {
    const alumno = { id: 1, nombre: 'Mati', fecha_nacimiento: '2006-08-03' };

    assert.deepEqual(agregarEdad(alumno, fechaFija), {
        id: 1,
        nombre: 'Mati',
        fecha_nacimiento: '2006-08-03',
        edad: 20
    });
});

test('agregarEdad devuelve el mismo valor si recibe null', () => {
    assert.equal(agregarEdad(null), null);
});
