import pkg from 'pg'
import config from './../configs/db-config.js';
import LogHelper from './../helpers/log-helper.js'

const { Pool } = pkg;

export default class DbPg {
    static sharedPool = null;

    constructor() {
    }

    getDBPool = () => {
        // [IA] Recomendacion elegida: compartir el Pool entre todos los repositories.
        // [YO] Lo mantuve lazy para no abrir conexiones antes de la primera query.
        if (DbPg.sharedPool == null) {
            DbPg.sharedPool = new Pool(config);
        }
        return DbPg.sharedPool;
    }

    queryAll = async (sql, values = null) => {
        let returnArray = null;
        try {
            const resultPg = values
                ? await this.getDBPool().query(sql, values)
                : await this.getDBPool().query(sql);
            returnArray = resultPg.rows;
        } catch (error) {
            LogHelper.logError(error);
            throw error;
        }
        return returnArray;
    }

    queryOne = async (sql, values = null) => {
        let returnEntity = null;
        try {
            const resultPg = values
                ? await this.getDBPool().query(sql, values)
                : await this.getDBPool().query(sql);
            if (resultPg.rows.length > 0) {
                returnEntity = resultPg.rows[0];
            }
        } catch (error) {
            LogHelper.logError(error);
            throw error;
        }
        return returnEntity;
    }

    queryReturnId = async (sql, values = null) => {
        let newId = 0;
        try {
            const resultPg = values
                ? await this.getDBPool().query(sql, values)
                : await this.getDBPool().query(sql);
            newId = resultPg.rows[0].id;
        } catch (error) {
            LogHelper.logError(error);
            throw error;
        }
        return newId;
    }

    queryRowCount = async (sql, values = null) => {
        let rowsAffected = 0;
        try {
            const resultPg = values
                ? await this.getDBPool().query(sql, values)
                : await this.getDBPool().query(sql);
            rowsAffected = resultPg.rowCount;
        } catch (error) {
            LogHelper.logError(error);
            throw error;
        }
        return rowsAffected;
    }
}
