const runner = require('./index');
const command = `"C:\\iacon\\apagar-node\\node_modules\\dharma-python-lib\\python3\\_python.exe" "C:\\iacon\\apagar-node\\teste.py" empresa=615`;
// const command = `"python3.exe" "C:\\iacon\\apagar-node\\teste.py" empresa=615`;
const tools = require('subheaven-tools');

(async() => {
    await tools.debug(command);
    let resultado = await runner.execute(command);
    await tools.debug(resultado);
})();