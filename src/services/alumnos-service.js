import AlumnosRepository from '../repositories/alumnos-repository.js';
import CursosService from './cursos-service.js';
import { agregarEdad } from '../helpers/fechas-helper.js';
import { ErrorValidacion } from '../helpers/errores-helper.js';
import { validarAlumno } from '../helpers/validaciones-helper.js';

export default class AlumnosService {
    constructor(alumnosRepository = new AlumnosRepository(), cursosService = new CursosService()) {
        console.log('Estoy en: AlumnosService.constructor()');
        this.AlumnosRepository = alumnosRepository;
        this.CursosService = cursosService;
    }

    getAllAsync = async () => {
        console.log(`AlumnosService.getAllAsync()`);
        const returnArray = await this.AlumnosRepository.getAllAsync();
        if (returnArray == null) return null;
        return returnArray.map(alumno => agregarEdad(alumno));
    }

    getByIdAsync = async (id) => {
        console.log(`AlumnosService.getByIdAsync(${id})`);
        const returnEntity = await this.AlumnosRepository.getByIdAsync(id);
        // Regla de negocio que agrega la edad.!!!
        return agregarEdad(returnEntity);
    }

    createAsync = async (entity) => {
        console.log(`AlumnosService.createAsync(${JSON.stringify(entity)})`);
        validarAlumno(entity);
        // Regla de negocio!!!
        await this.validarCursoExiste(entity.id_curso);
        // Si llegue aca es que no hubo un error.
        const rowsAffected = await this.AlumnosRepository.createAsync(entity);
        return rowsAffected;
    }

    updateAsync = async (entity) => {
        console.log(`AlumnosService.updateAsync(${JSON.stringify(entity)})`);
        validarAlumno(entity, { parcial: true });
        // Regla de Negocio!
        if (entity.id_curso) {
            await this.validarCursoExiste(entity.id_curso);
        }
        
        const rowsAffected = await this.AlumnosRepository.updateAsync(entity);
        return rowsAffected;
    }

    deleteByIdAsync = async (id) => {
        console.log(`AlumnosService.deleteByIdAsync(${id})`);
        const rowsAffected = await this.AlumnosRepository.deleteByIdAsync(id);
        return rowsAffected;
    }

    validarCursoExiste = async (idCurso) => {
        if (!idCurso) return; // Early return

        const curso = await this.CursosService.getByIdAsync(idCurso);
        if (curso == null) {
            throw new ErrorValidacion(`El curso con id ${idCurso} no existe.`);
        }
    }
}
