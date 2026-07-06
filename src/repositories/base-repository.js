import Db from './db-pg.js';

export default class BaseRepository {
    constructor(tableName, repositoryName) {
        this.tableName = tableName;
        this.repositoryName = repositoryName;
        this.db = new Db();
    }

    getAllAsync = async () => {
        console.log(`${this.repositoryName}.getAllAsync()`);
        const sql = `SELECT * FROM ${this.tableName}`;
        return await this.db.queryAll(sql);
    }

    getByIdAsync = async (id) => {
        console.log(`${this.repositoryName}.getByIdAsync(${id})`);
        const sql = `SELECT * FROM ${this.tableName} WHERE id=$1`;
        return await this.db.queryOne(sql, [id]);
    }

    deleteByIdAsync = async (id) => {
        console.log(`${this.repositoryName}.deleteByIdAsync(${id})`);
        const sql = `DELETE FROM ${this.tableName} WHERE id=$1`;
        return await this.db.queryRowCount(sql, [id]);
    }
}
