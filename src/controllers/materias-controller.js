import { Router } from 'express';
import MateriasService from './../services/materias-service.js'
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
const currentService = new MateriasService();

router.get('', async (req, res) => {
    try {
        console.log(`MateriasController.get`);
        const returnArray = await currentService.getAllAsync();
        if (returnArray != null){
            responderOk(res, returnArray);
        } else {
            responderError(res, new Error('No se pudo obtener la lista de materias.'));
        }
    } catch (error) {
        console.log(error);
        responderError(res, error);
    }
});

router.get('/:id', async (req, res) => {
    try {
        const id = parsearId(req.params.id);
        const returnEntity = await currentService.getByIdAsync(id);
        if (returnEntity != null){
            responderOk(res, returnEntity);
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
        let entity = req.body;
        const newId = await currentService.createAsync(entity);
        if (newId > 0 ){
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
        let entity = req.body;

        validarIdBody(entity, id);

        entity.id = id;
        const rowsAffected = await currentService.updateAsync(entity);
        if (rowsAffected != 0){
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
        const rowCount = await currentService.deleteByIdAsync(id);
        if (rowCount != 0){
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
