const Agent = require('./agent') // Импорт агента
const VERSION = 7 // Версия сервера
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function createAgent(teamName, coords, position, goalie) {
    let agent = new Agent(teamName, position); // Создание экземпляра агента
    console.log('agent', agent)
    require('./socket')(agent, teamName, VERSION, goalie) //Настройка сокета
    setTimeout(() => {
        agent.socketSend("move", `${position === 'r' ? '-' : ''}${coords}`)
        //agent.socketSend("move", `${x} ${y}`)
    }, 20)
}

createAgent("biba", "-10 -5", 'l', false)
createAgent("biba", "-15 5", 'l', false)
createAgent("biba", "-15 -15", 'l', false)
createAgent("boba", "15 0", 'r', true)