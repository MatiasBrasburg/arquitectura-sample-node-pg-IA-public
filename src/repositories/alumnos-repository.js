import BaseRepository from './base-repository.js';

export default class AlumnosRepository extends BaseRepository {
    constructor() {
        super('alumnos', 'AlumnosRepository-new');
        console.log('Estoy en: AlumnosRepository-new.constructor()');
    }

    createAsync = async (entity) => {
        console.log(`AlumnosRepository-new.createAsync(${JSON.stringify(entity)})`);
        const sql = ` INSERT INTO alumnos (
                            nombre              ,
                            apellido            ,
                            id_curso            ,
                            fecha_nacimiento    ,
                            hace_deportes
                        ) VALUES (
                            $1,
                            $2,
                            $3,
                            $4,
                            $5
                        ) RETURNING id`;
        const values = [
            entity?.nombre           ?? '',
            entity?.apellido         ?? '',
            entity?.id_curso         ?? 0,
            entity?.fecha_nacimiento ?? null,
            entity?.hace_deportes    ?? 0
        ];
        return await this.db.queryReturnId(sql, values);
    }

    updateAsync = async (entity) => {
        console.log(`AlumnosRepository-new.updateAsync(${JSON.stringify(entity)})`);
        let id = entity.id;

        const previousEntity = await this.getByIdAsync(id);
        if (previousEntity == null) return 0;

        const sql = `UPDATE alumnos SET
                        nombre              = $2,
                        apellido            = $3,
                        id_curso            = $4,
                        fecha_nacimiento    = $5,
                        hace_deportes       = $6
                    WHERE id = $1`;
        const values = [
            id,
            entity?.nombre           ?? previousEntity?.nombre,
            entity?.apellido         ?? previousEntity?.apellido,
            entity?.id_curso         ?? previousEntity?.id_curso,
            entity?.fecha_nacimiento ?? previousEntity?.fecha_nacimiento,
            entity?.hace_deportes    ?? previousEntity?.hace_deportes
        ];
        return await this.db.queryRowCount(sql, values);
    }

}
