# subheaven-command-runner
Modulo para a execução de comandos de prompts de comando e gerenciar o resultado

Como instalar:
```
npm i https://github.com/SubHeaven/subheaven-command-runner
```

## Como rodar um comando
```
let resultado = await runner.execute(`python3 "${process.cwd()}\\hello.py" mensagem="Olá mundo!"`);
console.log(resultado);
```

## Como acessar os logs de execução
```
let logs = await runner.logs();
console.log(logs);
```

## Como acessar os logs de erros de execução
```
let errors = await runner.errors();
console.log(errors);
```
