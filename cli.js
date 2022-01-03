const runner = require('./index.js');
const argParse = require('subheaven-arg');
const tools = require('subheaven-tools');

argParse.init("subheaven-command-runner", "Gerenciamento do executor de comandos");
argParse.named("ult-logs", "Mostra os N logs ao rodar um comando.", { required: false, default: "", sample: "10" });
argParse.named("ult-erros", "Mostra os N erros ao rodar um comando.", { required: false, default: "", sample: "10" });
argParse.boolean("test", "Testa o módulo executando uma séries de testes")
(async() => {
    if (argParse.validate()) {
        if (params.test) {
            let resultado = {};
            resultado = await runner.execute(`python3 "${process.cwd()}\\hello.py" mensagem="Olá mundo!"`)
            resultado = await runner.execute(`python3 "${process.cwd()}\\hello.py" mensagem="Olá mundo!" loop=2`)
            resultado = await runner.execute(`python3 "${process.cwd()}\\hello.py" mensagem="Olá mundo!" --erro`)
            resultado = await runner.execute(`python3 "${process.cwd()}\\hello.py" mensagem="Olá mundo!"`)
            // let resultado = await runner.execute(`python3 "${process.cwd()}\\hello.py" mensagem="Olá mundo!"`)
            // let resultado = await runner.execute(`python3 "${process.cwd()}\\hello.py" mensagem="Olá mundo!" loop=4`)
            // let resultado = await runner.execute(`python3 "${process.cwd()}\\hello.py" mensagem="Olá mundo!" --erro`)
            await tools.debug(resultado);
            console.log(resultado.log);
    
            let logs = await runner.logs();
            tools.debug('logs:', logs);
    
            let errors = await runner.errors();
            tools.debug('erros:', errors);
        } else if (params['ult-logs'] !== '') {
            let logs = await runner.logs();
            tools.debug('logs:', logs);
        } else if (params['ult-erros'] !== '') {
            let errors = await runner.errors();
            tools.debug('erros:', errors);
        }
    }
})();