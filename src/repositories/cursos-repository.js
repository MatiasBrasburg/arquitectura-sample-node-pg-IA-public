import BaseRepository from './base-repository.js';

export default class CursosRepository extends BaseRepository {
    constructor() {
        super('cursos', 'CursosRepository');
        console.log('Estoy en: CursosRepository.constructor()');
    }

    createAsync = async (entity) => {
        console.log(`CursosRepository.createAsync(${JSON.stringify(entity)})`);
        const sql = `INSERT INTO cursos (nombre) VALUES ($1) RETURNING id`;
        const values = [entity?.nombre ?? ''];
        return await this.db.queryReturnId(sql, values);
    }

    updateAsync = async (entity) => {
        console.log(`CursosRepository.updateAsync(${JSON.stringify(entity)})`);
        const sql = `UPDATE cursos SET nombre = $2 WHERE id = $1`;
        const values =  [   entity.id, 
                            entity?.nombre ?? ''
                        ];
        return await this.db.queryRowCount(sql, values);
    }

}
