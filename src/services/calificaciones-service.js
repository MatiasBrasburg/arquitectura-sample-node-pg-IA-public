import CalificacionesRepository from '../repositories/calificaciones-repository.js';
import AlumnosService from './alumnos-service.js';
import MateriasService from './materias-service.js';
import { ErrorConflicto, ErrorValidacion } from '../helpers/errores-helper.js';
import { validarCalificacion } from '../helpers/validaciones-helper.js';

export default class CalificacionesService {
    constructor() {
        console.log('Estoy en: CalificacionesService.constructor()');
        this.CalificacionesRepository = new CalificacionesRepository();
        this.AlumnosService = new AlumnosService();
        this.MateriasService = new MateriasService();
    }

    getAllAsync = async () => {
        return await this.CalificacionesRepository.getAllAsync();
    }

    getByIdAsync = async (id) => {
        return await this.CalificacionesRepository.getByIdAsync(id);
    }

    createAsync = async (entity) => {
        validarCalificacion(entity);
        await this.validarReferencias(entity);
        await this.validarNoDuplicada(entity.id_alumno, entity.id_materia);

        try {
            return await this.CalificacionesRepository.createAsync(entity);
        } catch (error) {
            if (error?.code === '23505') {
                throw new ErrorConflicto('El alumno ya tiene una calificación para esa materia.');
            }
            throw error;
        }
    }

    updateAsync = async (entity) => {
        validarCalificacion(entity, { parcial: true });

        const anterior = await this.CalificacionesRepository.getByIdAsync(entity.id);
        if (anterior == null) return 0;

        const completa = { ...anterior, ...entity };
        await this.validarReferencias(completa);
        await this.validarNoDuplicada(completa.id_alumno, completa.id_materia, entity.id);

        try {
            return await this.CalificacionesRepository.updateAsync(completa);
        } catch (error) {
            if (error?.code === '23505') {
                throw new ErrorConflicto('El alumno ya tiene una calificación para esa materia.');
            }
            throw error;
        }
    }

    deleteByIdAsync = async (id) => {
        return await this.CalificacionesRepository.deleteByIdAsync(id);
    }

    validarReferencias = async (entity) => {
        const [alumno, materia] = await Promise.all([
            this.AlumnosService.getByIdAsync(entity.id_alumno),
            this.MateriasService.getByIdAsync(entity.id_materia)
        ]);

        if (alumno == null) {
            throw new ErrorValidacion(`El alumno con id ${entity.id_alumno} no existe.`);
        }
        if (materia == null) {
            throw new ErrorValidacion(`La materia con id ${entity.id_materia} no existe.`);
        }
    }

    validarNoDuplicada = async (idAlumno, idMateria, idExcluir = null) => {
        const existente = await this.CalificacionesRepository.getByAlumnoMateriaAsync(
            idAlumno,
            idMateria,
            idExcluir
        );

        if (existente != null) {
            throw new ErrorConflicto('El alumno ya tiene una calificación para esa materia.');
        }
    }
}
