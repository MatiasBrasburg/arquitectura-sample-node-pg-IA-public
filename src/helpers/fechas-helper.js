function crearFecha(valor) {
    if (typeof valor === 'string') {
        const partes = valor.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (partes) {
            const [, anio, mes, dia] = partes;
            const fecha = new Date(Number(anio), Number(mes) - 1, Number(dia));
            const fechaValida =
                fecha.getFullYear() === Number(anio) &&
                fecha.getMonth() === Number(mes) - 1 &&
                fecha.getDate() === Number(dia);

            return fechaValida ? fecha : new Date(Number.NaN);
        }
    }

    return new Date(valor);
}

export function calcularEdad(fechaNacimiento, fechaActual = new Date()) {
    if (!fechaNacimiento) return null;

    const hoy = crearFecha(fechaActual);
    const nacimiento = crearFecha(fechaNacimiento);

    if (Number.isNaN(hoy.getTime()) || Number.isNaN(nacimiento.getTime())) {
        return null;
    }

    if (nacimiento > hoy) {
        return null;
    }

    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mesDiff = hoy.getMonth() - nacimiento.getMonth();

    if (mesDiff < 0 || (mesDiff === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
    }

    return edad;
}

export function agregarEdad(entidad, fechaActual = new Date()) {
    if (!entidad) return entidad;
    return { ...entidad, edad: calcularEdad(entidad.fecha_nacimiento, fechaActual) };
}
