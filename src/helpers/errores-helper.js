export class ErrorHttp extends Error {
    constructor(statusCode, message) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.esErrorControlado = true;
    }
}

export class ErrorValidacion extends ErrorHttp {
    constructor(message) {
        super(400, message);
    }
}

export class ErrorConflicto extends ErrorHttp {
    constructor(message) {
        super(409, message);
    }
}
