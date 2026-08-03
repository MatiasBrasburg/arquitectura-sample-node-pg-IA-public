import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/server.js';

function listen(appInstance) {
    return new Promise((resolve) => {
        const server = appInstance.listen(0, () => resolve(server));
    });
}

test('POST /api/auth/login devuelve 401 con credenciales invalidas', async () => {
    const previousEnv = {
        AUTH_USERNAME: process.env.AUTH_USERNAME,
        AUTH_PASSWORD: process.env.AUTH_PASSWORD,
        JWT_SECRET: process.env.JWT_SECRET,
        JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN
    };

    process.env.AUTH_USERNAME = 'admin-test';
    process.env.AUTH_PASSWORD = 'clave-test';
    process.env.JWT_SECRET = 'secreto-test-para-ejercicio-7';
    process.env.JWT_EXPIRES_IN = '1h';

    const server = await listen(app);

    try {
        const baseUrl = `http://127.0.0.1:${server.address().port}`;
        const response = await fetch(`${baseUrl}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario: 'admin-test', clave: 'incorrecta' })
        });

        const body = await response.text();

        assert.equal(response.status, 401);
        assert.match(body, /Credenciales incorrectas/);
    } finally {
        await new Promise((resolve, reject) => {
            server.close((error) => error ? reject(error) : resolve());
        });
        process.env.AUTH_USERNAME = previousEnv.AUTH_USERNAME;
        process.env.AUTH_PASSWORD = previousEnv.AUTH_PASSWORD;
        process.env.JWT_SECRET = previousEnv.JWT_SECRET;
        process.env.JWT_EXPIRES_IN = previousEnv.JWT_EXPIRES_IN;
    }
});

test('POST /api/auth/login devuelve token con credenciales validas', async () => {
    const previousEnv = {
        AUTH_USERNAME: process.env.AUTH_USERNAME,
        AUTH_PASSWORD: process.env.AUTH_PASSWORD,
        JWT_SECRET: process.env.JWT_SECRET,
        JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN
    };

    process.env.AUTH_USERNAME = 'admin-test';
    process.env.AUTH_PASSWORD = 'clave-test';
    process.env.JWT_SECRET = 'secreto-test-para-ejercicio-7';
    process.env.JWT_EXPIRES_IN = '1h';

    const server = await listen(app);

    try {
        const baseUrl = `http://127.0.0.1:${server.address().port}`;
        // [YO] Verifico status y body para que el test no sea solo "no tiro error".
        const response = await fetch(`${baseUrl}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario: 'admin-test', clave: 'clave-test' })
        });

        const body = await response.json();

        assert.equal(response.status, 200);
        assert.equal(body.tokenType, 'Bearer');
        assert.equal(typeof body.token, 'string');
        assert.ok(body.token.length > 20);
    } finally {
        await new Promise((resolve, reject) => {
            server.close((error) => error ? reject(error) : resolve());
        });
        process.env.AUTH_USERNAME = previousEnv.AUTH_USERNAME;
        process.env.AUTH_PASSWORD = previousEnv.AUTH_PASSWORD;
        process.env.JWT_SECRET = previousEnv.JWT_SECRET;
        process.env.JWT_EXPIRES_IN = previousEnv.JWT_EXPIRES_IN;
    }
});
