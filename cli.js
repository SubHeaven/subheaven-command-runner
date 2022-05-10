const runner = require('./index.js');
const argParse = require('subheaven-arg');
const tools = require('subheaven-tools');

argParse.init("subheaven-command-runner", "Gerenciamento do executor de comandos");
argParse.named("ult-logs", "Mostra os N logs ao rodar um comando.", { required: false, default: "", sample: "10" });
argParse.named("ult-erros", "Mostra os N erros ao rodar um comando.", { required: false, default: "", sample: "10" });
argParse.boolean("long", "Roda um comando com processamento mais demorado");
argParse.boolean("error", "Executa um comando com erro");
argParse.boolean("test", "Testa o módulo executando uma séries de testes");
argParse.boolean("test-npm", "Testa o módulo executando uma séries de testes");
argParse.named("show-logs", "Mostra os N erros ao rodar um comando.", { required: false, default: "", sample: "10" });
(async() => {
    if (argParse.validate()) {
        if (params.test) {
            let resultado = await runner.execute(`python3 "${process.cwd()}\\hello.py" mensagem="Olá mundo!"`)
            await tools.debug(resultado.log);
        } else if (params.long) {
            await runner.execute(`python3 "C:\\iacon\\dharma-servicos\\tools\\ConsolidarEmpresasVigencias.py" 1 2021`);
        } else if (params.error) {
            let resultado = await runner.execute(`python3 "${process.cwd()}\\hello.py" mensagem="Olá mundo!" --error`);
            await tools.debug(resultado.log);
        } else if (params['test-npm']) {
            let resultado = await runner.execute(`npm.cmd -g ls --depth 0`);
            await tools.debug(resultado.log);
        } else if (params['show-logs'] !== '') {
            await tools.debug({ uuid: params['show-logs'] });
            let logs = await runner.logs({ uuid: params['show-logs'] });
            await tools.debug('logs:', logs);
        } else if (params['ult-logs'] !== '') {
            let logs = await runner.logs();
            await tools.debug('logs:', logs.logs);
        } else if (params['ult-erros'] !== '') {
            let errors = await runner.errors();
            await tools.debug('erros:', errors);
        }
    }
})();