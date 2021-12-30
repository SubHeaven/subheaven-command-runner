const log = require('debug')('subheaven:command-runner');
const tools = require('subheaven-tools');
const { spawn } = require('child_process');
const local_db = require('subheaven-local-db');

class CommandRunner {
    history = [];
    errors = [];
    database = {};

    constructor() {
        this.database = local_db('command-runner');
        (async() => {
            await this.database.set_limit('logs', 100);
            await this.database.set_limit('errors', 100);
        })();
    }

    execute = async(command) => {
        return new Promise((resolve, reject) => {
            try {
                let _p = command.split(" ");
                let _c = _p.shift();
                let _log = '';
                let _err = '';
                var work = spawn(_c, [_p.join(" ")], {
                    windowsVerbatimArguments: true,
                    windowsHide: true
                });
                work.stdout.on('data', function(data) {
                    _log = `${_log}${data}`;
                });
                work.stderr.on('data', (data) => {
                    _err = `${_err}${data}`;
                });
                work.stdout.on('end', function(data) {
                    // tools.debug('end', `${data}`);
                });

                work.on('exit', async (code) => {
                    let now = await tools.now();
                    let history = { command: command, log: _log, code: code, err: _err, time: now };
                    await this.database.insert('logs', history);
                    if (_err != '') {
                        await this.database.insert('errors', history);
                    }
                    resolve(history);
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    logs = async () => {
        return await this.database.find('logs');
    }

    errors = async () => {
        return await this.database.find('errors');
    }
}

module.exports = new CommandRunner();