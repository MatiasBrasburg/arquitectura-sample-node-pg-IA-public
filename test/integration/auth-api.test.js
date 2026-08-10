import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import app from '../../src/server.js';

let server;
let baseUrl;
const anteriores = {};

describe('POST /api/auth/login', () => {
    before(async () => {
        for (const clave of ['AUTH_USERNAME', 'AUTH_PASSWORD', 'JWT_SECRET', 'JWT_EXPIRES_IN']) {
            anteriores[clave] = process.env[clave];
        }
        process.env.AUTH_USERNAME = 'admin-test';
        process.env.AUTH_PASSWORD = 'clave-test';
        process.env.JWT_SECRET = 'secreto-test-seguro-y-suficientemente-largo';
        process.env.JWT_EXPIRES_IN = '1h';

        server = await new Promise(resolve => {
            const instancia = app.listen(0, '127.0.0.1', () => resolve(instancia));
        });
        baseUrl = `http://127.0.0.1:${server.address().port}`;
    });

    after(async () => {
        await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
        for (const [clave, valor] of Object.entries(anteriores)) {
            if (valor === undefined) delete process.env[clave];
            else process.env[clave] = valor;
        }
    });

    test('credenciales válidas devuelven 200 y un token Bearer', async () => {
        const response = await fetch(`${baseUrl}/api/auth/login`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario: 'admin-test', clave: 'clave-test' })
        });
        const body = await response.json();

        assert.equal(response.status, 200);
        assert.equal(body.tokenType, 'Bearer');
        assert.match(body.token, /^[\w-]+\.[\w-]+\.[\w-]+$/);
    });

    test('clave inválida devuelve 401 y no entrega token', async () => {
        const response = await fetch(`${baseUrl}/api/auth/login`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario: 'admin-test', clave: 'incorrecta' })
        });
        const body = await response.text();

        assert.equal(response.status, 401);
        assert.match(body, /Credenciales incorrectas/);
        assert.doesNotMatch(body, /token/i);
    });

    test('body vacío devuelve 401 de forma controlada', async () => {
        const response = await fetch(`${baseUrl}/api/auth/login`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}'
        });
        assert.equal(response.status, 401);
    });
});
