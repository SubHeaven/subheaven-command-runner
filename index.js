const log = require('debug')('subheaven:command-runner');
const tools = require('subheaven-tools');
const { spawn } = require('child_process');
const local_db = async (name) => {};
const { v4 } = require('uuid');

class CommandRunner {
    history = [];
    errors = [];
    database = {};
    cache_logs = {};
    index_logs = [];
    loaded = false;

    constructor() {
        const SQLiter = require('./iacon-sqlite');
        this.database = new SQLiter('command-runner');
        (async() => {
            await this.database.checkTable('history', {
                uuid: {
                    type: 'text',
                    notnull: true
                },
                command: {
                    type: 'text',
                    notnull: true
                },
                initial: {
                    type: 'datetime'
                },
                log: {
                    type: 'text',
                    notnull: true
                },
                error: {
                    type: 'text',
                    notnull: true
                },
                success: {
                    type: 'boolean',
                    default: false
                }
            }, {
                "idx_history_uuid": ["uuid"],
                "idx_history_initial": ["initial"]
            });
            await this.database.checkTable('errors', { 
                command: {
                    type: 'text',
                    notnull: true
                },
                log: {
                    type: 'text'
                },
                code: {
                    type: 'integer'
                },
                err: {
                    type: 'text'
                },
                time: {
                    type: 'datetime'
                }
            }, {
                "idx_errors_time": ["time"]
            });
            // await this.database.set_limit('history', 200);
            // await this.database.set_limit('errors', 100);
            this.loaded = true;
        })();
    }

    splitCommand = (text) => {
        const re = /^"[^"]*"$/; // Check if argument is surrounded with double-quotes
        const re2 = /^([^"]|[^"].*?[^"])$/; // Check if argument is NOT surrounded with double-quotes

        let arr = [];
        let argPart = null;

        text && text.split(" ").forEach(function(arg) {
            if ((re.test(arg) || re2.test(arg)) && !argPart) {
                arr.push(arg);
            } else {
                argPart = argPart ? argPart + " " + arg : arg;
                // If part is complete (ends with a double quote), we can add it to the array
                if (/"$/.test(argPart)) {
                    arr.push(argPart);
                    argPart = null;
                }
            }
        });

        return arr;
    }

    base_execute = async(command, uuid=null) => {
        if (!uuid) {
            uuid = v4();
        }
        uuid = '079d5adc-4633-4a0e-b807-cd60b578238a';
        return new Promise(async (resolve, reject) => {
            try {
                let _p = this.splitCommand(command);
                let _c = _p.shift();
                let _log = '';
                let _err = '';
                await this.database.insert('history', {
                    uuid: uuid,
                    command: command,
                    initial: await tools.now(),
                    log: '',
                    error: ''
                });
                var work = spawn(_c, [_p.join(" ")], {
                    windowsVerbatimArguments: true,
                    windowsHide: true,
                    // detached: true,
                    shell: true
                });
                work.stdout.on('data', async (data) => {
                    process.stdout.write(`${data}`);
                    _log = `${_log}${data}`;
                    await this.database.execute(`UPDATE history SET log = '${_log}' WHERE uuid = '${uuid}'`);
                });
                work.stderr.on('data', async (data) => {
                    process.stdout.write(`${data}`);
                    _err = `${_err}${data}`;
                    await this.database.execute(`UPDATE history SET error = '${_err}' WHERE uuid = '${uuid}'`);
                });
                work.stdout.on('end', function(data) {
                    // console.log('end');
                    // tools.debug('end', `${data}`);
                });

                work.on('exit', async (code) => {
                    // console.log('exit');
                    let now = await tools.now();
                    let history = { command: command, log: _log, code: code, err: _err, time: now };
                    if (_err != '' || code > 0) {
                        await this.database.insert('errors', history);
                        await this.database.execute(`UPDATE history SET error = '${_err}' WHERE uuid = '${uuid}'`);
                    } else {
                        await this.database.execute(`UPDATE history SET success = 1 WHERE uuid = '${uuid}'`);
                    }
                    resolve(history);
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    delay = (t) => {
        return new Promise(resolve => setTimeout(resolve, t));
    }

    execute = async(command, uuid=null) => {
        while (!this.loaded) {
            await this.delay(10);
        }
        return await this.base_execute(command, uuid=uuid);
    }

    logs = async (query={}) => {
        await tools.debug(query);
        return await this.database.find('history', query);
    }

    errors = async () => {
        return await this.database.find('errors');
    }
}

module.exports = new CommandRunner();