import { ErrorValidacion } from './errores-helper.js';

const esObjeto = (valor) => valor != null && typeof valor === 'object' && !Array.isArray(valor);
const tieneCampo = (objeto, campo) => Object.prototype.hasOwnProperty.call(objeto, campo);

export function parsearId(valor, nombre = 'id') {
    const texto = typeof valor === 'string' ? valor.trim() : String(valor);

    if (!/^[1-9]\d*$/.test(texto)) {
        throw new ErrorValidacion(`El ${nombre} debe ser un número entero positivo.`);
    }

    const id = Number(texto);
    if (!Number.isSafeInteger(id)) {
        throw new ErrorValidacion(`El ${nombre} debe ser un número entero positivo.`);
    }

    return id;
}

export function validarIdBody(entity, idUrl) {
    if (!esObjeto(entity)) {
        throw new ErrorValidacion('El body debe ser un objeto JSON.');
    }

    if (tieneCampo(entity, 'id') && entity.id != null) {
        const idBody = parsearId(entity.id, 'id del body');
        if (idBody !== idUrl) {
            throw new ErrorValidacion(`El id de la URL (${idUrl}) no coincide con el id del body (${idBody}).`);
        }
    }
}

function validarTexto(valor, campo, maximo = 75) {
    if (typeof valor !== 'string' || valor.trim().length === 0) {
        throw new ErrorValidacion(`El campo ${campo} es obligatorio.`);
    }
    if (valor.trim().length > maximo) {
        throw new ErrorValidacion(`El campo ${campo} no puede superar los ${maximo} caracteres.`);
    }
}

function validarFecha(valor, campo) {
    if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
        throw new ErrorValidacion(`El campo ${campo} debe tener formato YYYY-MM-DD.`);
    }

    const [anio, mes, dia] = valor.split('-').map(Number);
    const fecha = new Date(Date.UTC(anio, mes - 1, dia));
    const esReal = fecha.getUTCFullYear() === anio
        && fecha.getUTCMonth() === mes - 1
        && fecha.getUTCDate() === dia;

    if (!esReal) {
        throw new ErrorValidacion(`El campo ${campo} contiene una fecha inválida.`);
    }

    return fecha;
}

export function validarAlumno(entity, { parcial = false } = {}) {
    if (!esObjeto(entity)) {
        throw new ErrorValidacion('El body debe ser un objeto JSON.');
    }

    const campos = ['nombre', 'apellido', 'id_curso', 'fecha_nacimiento', 'hace_deportes'];
    if (!parcial) {
        for (const campo of campos) {
            if (!tieneCampo(entity, campo)) {
                throw new ErrorValidacion(`El campo ${campo} es obligatorio.`);
            }
        }
    } else if (!campos.some(campo => tieneCampo(entity, campo))) {
        throw new ErrorValidacion('Debe enviar al menos un campo para actualizar el alumno.');
    }

    if (tieneCampo(entity, 'nombre')) validarTexto(entity.nombre, 'nombre');
    if (tieneCampo(entity, 'apellido')) validarTexto(entity.apellido, 'apellido');

    if (tieneCampo(entity, 'id_curso')) {
        if (!Number.isSafeInteger(entity.id_curso) || entity.id_curso <= 0) {
            throw new ErrorValidacion('El campo id_curso debe ser un número entero positivo.');
        }
    }

    if (tieneCampo(entity, 'fecha_nacimiento')) {
        const fecha = validarFecha(entity.fecha_nacimiento, 'fecha_nacimiento');
        if (fecha > new Date()) {
            throw new ErrorValidacion('La fecha_nacimiento no puede estar en el futuro.');
        }
    }

    if (tieneCampo(entity, 'hace_deportes') && typeof entity.hace_deportes !== 'boolean') {
        throw new ErrorValidacion('El campo hace_deportes debe ser booleano.');
    }
}

export function validarEntidadConNombre(entity, entidad) {
    if (!esObjeto(entity)) {
        throw new ErrorValidacion('El body debe ser un objeto JSON.');
    }
    validarTexto(entity.nombre, 'nombre');
    if (entidad && entity.nombre.trim().length === 0) {
        throw new ErrorValidacion(`El nombre de ${entidad} es obligatorio.`);
    }
}

export function validarCalificacion(entity, { parcial = false } = {}) {
    if (!esObjeto(entity)) {
        throw new ErrorValidacion('El body debe ser un objeto JSON.');
    }

    const campos = ['id_alumno', 'id_materia', 'nota', 'fecha'];
    const obligatorios = ['id_alumno', 'id_materia', 'nota'];

    if (!parcial) {
        for (const campo of obligatorios) {
            if (!tieneCampo(entity, campo)) {
                throw new ErrorValidacion(`El campo ${campo} es obligatorio.`);
            }
        }
    } else if (!campos.some(campo => tieneCampo(entity, campo))) {
        throw new ErrorValidacion('Debe enviar al menos un campo para actualizar la calificación.');
    }

    for (const campo of ['id_alumno', 'id_materia']) {
        if (tieneCampo(entity, campo) && (!Number.isSafeInteger(entity[campo]) || entity[campo] <= 0)) {
            throw new ErrorValidacion(`El campo ${campo} debe ser un número entero positivo.`);
        }
    }

    if (tieneCampo(entity, 'nota')
        && (!Number.isInteger(entity.nota) || entity.nota < 0 || entity.nota > 10)) {
        throw new ErrorValidacion('El campo nota debe ser un número entero entre 0 y 10.');
    }

    if (tieneCampo(entity, 'fecha') && entity.fecha != null) {
        validarFecha(entity.fecha, 'fecha');
    }
}
