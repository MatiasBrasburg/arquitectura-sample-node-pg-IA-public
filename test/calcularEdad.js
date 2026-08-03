
  import test from 'node:test';
  import assert from 'node:assert/strict';
  import { calcularEdad } from '../src/helpers/fechas-helper.js';

  const fechaActual = '2026-08-03';

  test('devuelve la edad si el cumpleaños ya paso', () => {
      assert.equal(calcularEdad('2006-08-02', fechaActual), 20);
  });
  // lo que este test hace es validar que la persona ya cumplio años es decir que si cumplio antes de la fecha de hoy tendria que tener 20 años 

  test('devule la edad si no cumplio años todavia',() =>{

    assert.equal(calcularEdad('2006-08-04',fechaActual),20);
  })