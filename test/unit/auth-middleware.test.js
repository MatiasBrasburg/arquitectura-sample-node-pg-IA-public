import { afterEach, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import authMiddleware from '../../src/middlewares/auth-middleware.js';

const SECRETO = 'secreto-de-prueba-suficientemente-largo';
let secretoAnterior;

function crearRespuesta() {
    return {
        statusCode: null,
        body: null,
        status(code) { this.statusCode = code; return this; },
        send(body) { this.body = body; return this; }
    };
}

function ejecutar(authorization) {
    const req = { headers: {} };
    if (authorization !== undefined) req.headers.authorization = authorization;
    const res = crearRespuesta();
    let llamadasNext = 0;

    authMiddleware(req, res, () => { llamadasNext++; });
    return { req, res, llamadasNext };
}

describe('authMiddleware', () => {
    beforeEach(() => {
        secretoAnterior = process.env.JWT_SECRET;
        process.env.JWT_SECRET = SECRETO;
    });

    afterEach(() => {
        if (secretoAnterior === undefined) delete process.env.JWT_SECRET;
        else process.env.JWT_SECRET = secretoAnterior;
    });

    test('sin Authorization devuelve 401 y no continúa', () => {
        const { res, llamadasNext } = ejecutar();
        assert.equal(res.statusCode, 401);
        assert.match(res.body, /Falta el header Authorization/);
        assert.equal(llamadasNext, 0);

        const headerVacio = ejecutar('');
        assert.equal(headerVacio.res.statusCode, 401);
        assert.match(headerVacio.res.body, /Falta el header Authorization/);
        assert.equal(headerVacio.llamadasNext, 0);
    });

    test('rechaza formatos que no sean Bearer token', () => {
        for (const header of ['Basic abc', 'Bearer', 'Bearer uno dos']) {
            const { res, llamadasNext } = ejecutar(header);
            assert.equal(res.statusCode, 401);
            assert.match(res.body, /formato Bearer/);
            assert.equal(llamadasNext, 0);
        }
    });

    test('sin JWT_SECRET devuelve 500 de forma controlada', (t) => {
        delete process.env.JWT_SECRET;
        t.mock.method(console, 'error', () => {});

        const { res, llamadasNext } = ejecutar('Bearer token-cualquiera');
        assert.equal(res.statusCode, 500);
        assert.equal(res.body, 'Error interno.');
        assert.equal(llamadasNext, 0);
    });

    test('token con firma inválida devuelve 401', () => {
        const token = jwt.sign({ sub: 'ana' }, 'otro-secreto');
        const { res, llamadasNext } = ejecutar(`Bearer ${token}`);

        assert.equal(res.statusCode, 401);
        assert.match(res.body, /token es inv.lido/);
        assert.equal(llamadasNext, 0);
    });

    test('token vencido devuelve un mensaje específico', () => {
        const token = jwt.sign({ sub: 'ana' }, SECRETO, { expiresIn: -1 });
        const { res, llamadasNext } = ejecutar(`Bearer ${token}`);

        assert.equal(res.statusCode, 401);
        assert.match(res.body, /token est. vencido/);
        assert.equal(llamadasNext, 0);
    });

    test('token válido agrega el usuario al request y llama next una vez', () => {
        const token = jwt.sign({ sub: 'ana', rol: 'alumno' }, SECRETO, { expiresIn: '1h' });
        const { req, res, llamadasNext } = ejecutar(`bEaReR   ${token}`);

        assert.equal(res.statusCode, null);
        assert.equal(llamadasNext, 1);
        assert.equal(req.usuario.sub, 'ana');
        assert.equal(req.usuario.rol, 'alumno');
    });
});
