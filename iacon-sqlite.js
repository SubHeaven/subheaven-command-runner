const fs = require('fs');
const log = require('debug')('iacon:sqlite');
const mosql = require("mongo-to-sql-converter")
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const tools = require('subheaven-tools');
const util = require('util');
const { v4: uuidv4 } = require('uuid');

class SQLiter {
    db = null;
    schemas = {};
    defmap = {
        string: (name, options) => {
            let def = `${name} TEXT`;
            if ('notnull' in options && options.notnull) {
                def += ' NOT NULL';
            }
            if ('default' in options && options.default != '') {
                def += ` DEFAULT '${options.default}'`;
            }
            return def;
        },
        text: (name, options) => {
            let def = `${name} TEXT`;
            if ('notnull' in options && options.notnull) {
                def += ' NOT NULL';
            }
            if ('default' in options && options.default != '') {
                def += ` DEFAULT '${options.default}'`;
            }
            return def;
        },
        integer: (name, options) => {
            let def = `${name} INTEGER`;
            if ('notnull' in options && options.notnull) {
                def += ' NOT NULL';
            }
            if ('default' in options && options.default != '') {
                def += ` DEFAULT ${options.default}`;
            }
            return def;
        },
        boolean: (name, options) => {
            let def = `${name} BOOLEAN`;
            if ('notnull' in options && options.notnull) {
                def += ' NOT NULL';
            }
            if ('default' in options) {
                def += ` DEFAULT ${options.default ? '1' : '0'}`;
            }
            return def;
        },
        datetime: (name, options) => {
            let def = `${name} DATETIME`;
            if ('notnull' in options && options.notnull) {
                def += ' NOT NULL';
            }
            if ('default' in options && options.default != '') {
                def += ` DEFAULT DATETIME('${options.default}')`;
            }
            return def;
        },
        json: (name, options) => {
            let def = `${name} CLOB`;
            if ('notnull' in options && options.notnull) {
                def += ' NOT NULL';
            }
            if ('default' in options && options.default != '') {
                def += ` DEFAULT '${options.default}'`;
            }
            return def;
        }
    }
    insertMap = {
        string: async (value) => {
            return `'${value}'`;
        },
        text: async (value) => {
            return `'${value}'`;
        },
        integer: async (value) => {
            return `${value}`;
        },
        boolean: async (value) => {
            return `${value ? '1' : '0'}`;
        },
        datetime: async (value) => {
            if (value instanceof Date) {
                return `'${value.toISOString().replace('T', ' ').split('.')[0]}'`;
            } else {
                return `'${value}'`;
            }
        },
        json: async (value) => {
            return `'${JSON.stringify(value).split("'").join('<asp>')}'`;
        }
    }
    selectMap = {
        string: async (value) => {
            return value.toString();
        },
        text: async (value) => {
            return value.toString();
        },
        integer: async (value) => {
            return parseInt(value);
        },
        boolean: async (value) => {
            return value === 1;
        },
        datetime: async (value) => {
            if (value !== '') {
                return new Date(value);
            } else {
                return null;
            }
        },
        json: async (value) => {
            if (value !== '') {
                return JSON.parse(value);
            } else {
                return null;
            }
        }
    }

    constructor(name) {
        fs.mkdirSync(path.join(__dirname, 'local-db'), { recursive: true });
        this.db = new sqlite3.Database(path.join(__dirname, 'local-db', `${name}.db`));
        (async() => {
        })();
    }

    createTable = async(name, schema) => {
        let sql = `CREATE TABLE ${name} (`;
        sql += "\n    id TEXT PRIMARY KEY NOT NULL";
        const comma = ',\n';
        await Object.keys(schema).forEachAsync(async item => {
            sql += `${comma}    ${await this.defmap[schema[item].type](item, schema[item])}`;
        });
        sql += '\n)';
        await this.execute(sql);
    }

    createIndex = async(tablename, indexname, index) => {
        let index_count = await this.select(`SELECT name FROM sqlite_master WHERE type='index' and name='${indexname}'`);
        if (index_count.length === 0) {
            let sql = `CREATE INDEX ${indexname} ON ${tablename} (${index.join(", ")})`;
            await this.execute(sql);
        }
    }

    createIndexes = async (name, indexes) => {
        if (indexes != null) {
            let index_name = '';
            if (Array.isArray(indexes)) {
                await indexes.forEachAsync(async item => {
                    index_name = `idx_${name}_${item.join("_")}`;
                    await this.createIndex(name, index_name, item);
                });
            } else if (indexes instanceof Object) {
                await Object.keys(indexes).forEachAsync(async item => {
                    index_name = item;
                    await this.createIndex(name, index_name, indexes[item]);
                });
            }
        }
    }

    select = async (sql) => {
        return new Promise((resolve, reject) => {
            log('');
            log(sql);
            this.db.all(sql, async (error, rows) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    execute = async (sql) => {
        return new Promise((resolve, reject) => {
            log('');
            log(sql);
            this.db.run(sql, async (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    checkTable = async(name, schema, indexes = null) => {
        let sql = `SELECT name FROM sqlite_master WHERE type = 'table' AND name LIKE '${name}'`;
        let table_count = await this.select(sql);
        if (table_count.length === 0) {
            await this.createTable(name, schema);
            await this.createIndexes(name, indexes);
        }
        this.schemas[name] = schema;
    }

    insert = async(table, data) => {
        let uuid = uuidv4();
        let sql = `INSERT INTO ${table} (`;
        let comma = '\n';
        sql += `${comma}    id`
        comma = ',\n';
        await Object.keys(data).forEachAsync(async item => {
            sql += `${comma}    ${item}`
        });
        sql += `\n) VALUES (`;
        sql += `\n    '${uuid}'`
        await Object.keys(data).forEachAsync(async item => {
            let value = await this.insertMap[this.schemas[table][item].type](data[item]);
            sql += `${comma}    ${value}`
        });
        sql += `\n)`;
        await this.execute(sql);
    }

    unpackSelectData = async(table, data) => {
        await Object.keys(data).forEachAsync(async subitem => {
            if (subitem != 'id') {
                let type = this.schemas[table][subitem].type;
                let value = await this.selectMap[type](data[subitem]);
                data[subitem] = value;
            }
        });
        return data;
    }

    find = async(table, query) => {
        const local_find = `db.${table}.find(${JSON.stringify(query)});`;
        const sql = mosql.convertToSQL(local_find, true);
        let dataset = await this.select(sql);
        await dataset.forEachAsync(async (item, index) => {
            dataset[index] = await this.unpackSelectData(table, item);
        });
        return dataset;

    }
}

module.exports = SQLiter;