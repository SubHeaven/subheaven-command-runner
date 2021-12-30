const runner = require('./index.js');
const argParse = require('subheaven-arg');
const tools = require('subheaven-tools');

argParse.init("subheaven-npm-base", "Cumprimenta alguém");
argParse.positional("name", "Nome a ser cumprimentado", { required: false, default: "", sample: "SubHeaven" });
(async() => {
    if (argParse.validate()) {
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
    }
})();