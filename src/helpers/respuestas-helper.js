import { StatusCodes } from 'http-status-codes';

export const responderOk = (res, contenido) => {
    return res.status(StatusCodes.OK).json(contenido);
};

export const responderCreado = (res, contenido) => {
    return res.status(StatusCodes.CREATED).json(contenido);
};

export const responderBadRequestJson = (res, contenido) => {
    return res.status(StatusCodes.BAD_REQUEST).json(contenido);
};

export const responderBadRequestTexto = (res, mensaje) => {
    return res.status(StatusCodes.BAD_REQUEST).send(mensaje);
};

export const responderNotFound = (res, mensaje) => {
    return res.status(StatusCodes.NOT_FOUND).send(mensaje);
};

export const responderNoAutorizado = (res, mensaje) => {
    return res.status(StatusCodes.UNAUTHORIZED).send(mensaje);
};

export const responderConflicto = (res, mensaje) => {
    return res.status(StatusCodes.CONFLICT).send(mensaje);
};

export const responderErrorInterno = (res, mensaje = 'Error interno.') => {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(mensaje);
};

export const responderError = (res, error) => {
    if (error?.esErrorControlado === true) {
        return res.status(error.statusCode).send(error.message);
    }

    return responderErrorInterno(res);
};
