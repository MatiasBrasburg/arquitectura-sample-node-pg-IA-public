import { Router } from 'express';
import CalificacionesService from './../services/calificaciones-service.js';
import {
    responderBadRequestJson,
    responderCreado,
    responderError,
    responderNotFound,
    responderOk
} from './../helpers/respuestas-helper.js';
import { parsearId, validarIdBody } from './../helpers/validaciones-helper.js';
import authMiddleware from './../middlewares/auth-middleware.js';

const router = Router();
const currentService = new CalificacionesService();

router.get('', async (req, res) => {
    try {
        const entities = await currentService.getAllAsync();
        responderOk(res, entities);
    } catch (error) {
        console.log(error);
        responderError(res, error);
    }
});

router.get('/:id', async (req, res) => {
    try {
        const id = parsearId(req.params.id);
        const entity = await currentService.getByIdAsync(id);

        if (entity != null) {
            responderOk(res, entity);
        } else {
            responderNotFound(res, `No se encontro la entidad (id:${id}).`);
        }
    } catch (error) {
        console.log(error);
        responderError(res, error);
    }
});

router.post('', authMiddleware, async (req, res) => {
    try {
        const newId = await currentService.createAsync(req.body);

        if (newId > 0) {
            responderCreado(res, newId);
        } else {
            responderBadRequestJson(res, null);
        }
    } catch (error) {
        console.log(error);
        responderError(res, error);
    }
});

router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const id = parsearId(req.params.id);
        const entity = req.body;
        validarIdBody(entity, id);
        entity.id = id;

        const rowsAffected = await currentService.updateAsync(entity);
        if (rowsAffected !== 0) {
            responderOk(res, rowsAffected);
        } else {
            responderNotFound(res, `No se encontro la entidad (id:${id}).`);
        }
    } catch (error) {
        console.log(error);
        responderError(res, error);
    }
});

router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const id = parsearId(req.params.id);
        const rowsAffected = await currentService.deleteByIdAsync(id);

        if (rowsAffected !== 0) {
            responderOk(res, null);
        } else {
            responderNotFound(res, `No se encontro la entidad (id:${id}).`);
        }
    } catch (error) {
        console.log(error);
        responderError(res, error);
    }
});

export default router;
