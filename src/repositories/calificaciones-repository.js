import BaseRepository from './base-repository.js';

export default class CalificacionesRepository extends BaseRepository {
    constructor() {
        super('calificaciones', 'CalificacionesRepository');
        console.log('Estoy en: CalificacionesRepository.constructor()');
    }

    getByAlumnoMateriaAsync = async (idAlumno, idMateria, idExcluir = null) => {
        let sql = `SELECT * FROM calificaciones WHERE id_alumno=$1 AND id_materia=$2`;
        const values = [idAlumno, idMateria];

        if (idExcluir != null) {
            sql += ` AND id<>$3`;
            values.push(idExcluir);
        }

        return await this.db.queryOne(sql, values);
    }

    createAsync = async (entity) => {
        const tieneFecha = entity.fecha != null;
        const sql = tieneFecha
            ? `INSERT INTO calificaciones (id_alumno, id_materia, nota, fecha)
               VALUES ($1, $2, $3, $4) RETURNING id`
            : `INSERT INTO calificaciones (id_alumno, id_materia, nota)
               VALUES ($1, $2, $3) RETURNING id`;
        const values = tieneFecha
            ? [entity.id_alumno, entity.id_materia, entity.nota, entity.fecha]
            : [entity.id_alumno, entity.id_materia, entity.nota];

        return await this.db.queryReturnId(sql, values);
    }

    updateAsync = async (entity) => {
        const sql = `UPDATE calificaciones SET
                        id_alumno = $2,
                        id_materia = $3,
                        nota = $4,
                        fecha = $5
                    WHERE id = $1`;
        const values = [
            entity.id,
            entity.id_alumno,
            entity.id_materia,
            entity.nota,
            entity.fecha
        ];

        return await this.db.queryRowCount(sql, values);
    }
}
