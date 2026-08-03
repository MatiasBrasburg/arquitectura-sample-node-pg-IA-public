import { timingSafeEqual } from 'node:crypto';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { responderNoAutorizado, responderOk } from '../helpers/respuestas-helper.js';

const router = Router();

function compararSeguro(valorRecibido, valorEsperado) {
    if (typeof valorRecibido !== 'string' || typeof valorEsperado !== 'string') return false;

    const recibido = Buffer.from(valorRecibido);
    const esperado = Buffer.from(valorEsperado);
    return recibido.length === esperado.length && timingSafeEqual(recibido, esperado);
}

router.post('/login', (req, res) => {
    const usuarioConfigurado = process.env.AUTH_USERNAME;
    const claveConfigurada = process.env.AUTH_PASSWORD;
    const secreto = process.env.JWT_SECRET;

    if (!usuarioConfigurado || !claveConfigurada || !secreto) {
        console.error('Falta configurar AUTH_USERNAME, AUTH_PASSWORD o JWT_SECRET.');
        return res.status(500).send('Error interno.');
    }

    const { usuario, clave } = req.body ?? {};
    // [YO] Se ejecutan ambas comparaciones y no se usa == con la clave.
    const usuarioValido = compararSeguro(usuario, usuarioConfigurado);
    const claveValida = compararSeguro(clave, claveConfigurada);
    const credencialesValidas = usuarioValido && claveValida;

    if (!credencialesValidas) {
        return responderNoAutorizado(res, 'Credenciales incorrectas.');
    }

    // [IA] El payload no contiene la clave: un JWT está firmado, pero no cifrado.
    const token = jwt.sign(
        { sub: usuarioConfigurado },
        secreto,
        { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    return responderOk(res, { token, tokenType: 'Bearer' });
});

export default router;
