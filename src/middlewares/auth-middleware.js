import jwt from 'jsonwebtoken';
import { responderNoAutorizado } from '../helpers/respuestas-helper.js';

// [IA] Verifica la firma y la expiración; decode() no autenticaría el token.
export default function authMiddleware(req, res, next) {
    const authorization = req.headers.authorization;

    if (!authorization) {
        return responderNoAutorizado(res, 'Falta el header Authorization.');
    }

    const partes = authorization.trim().split(/\s+/);
    if (partes.length !== 2 || partes[0].toLowerCase() !== 'bearer' || !partes[1]) {
        return responderNoAutorizado(res, 'El header Authorization debe usar el formato Bearer <token>.');
    }

    const secreto = process.env.JWT_SECRET;
    if (!secreto) {
        console.error('Falta configurar JWT_SECRET.');
        return res.status(500).send('Error interno.');
    }

    try {
        req.usuario = jwt.verify(partes[1], secreto);
        return next();
    } catch (error) {
        if (error?.name === 'TokenExpiredError') {
            return responderNoAutorizado(res, 'El token está vencido.');
        }

        return responderNoAutorizado(res, 'El token es inválido.');
    }
}
