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
        // agent.socketSend("move", `${x} ${y}`)
    }, 20)
    // setTimeout(async () => {
    //     await agent.socketSend("move", `${coords}`)
    // }, 20)
}

// createAgent("biba", "-12 -15", 'l', false)
// // createAgent("biba", "-25 10", 'l', false)
// // createAgent("boba", "51 -8", 'r', false)
// createAgent("boba", "52.5 0", 'r', true)
setTimeout(()=> {
    createAgent('Biba', '-10 0', 'l', false)
},100)
setTimeout(()=> {
    createAgent('Biba', '-5 -25', 'l', false)
},100)
setTimeout(()=> {
    createAgent('Biba',  '-5 25', 'l', false)
},100)
setTimeout(()=> {
    createAgent('Biba', '-15 -15', 'l', false)
},100)
setTimeout(()=> {
    createAgent('Biba', '-15 15', 'l', false)
},100)
setTimeout(()=> {
    createAgent('Biba', '-25 -15', 'l', false)
},100)
setTimeout(()=> {
    createAgent('Biba', '-25 15', 'l', false)
},100)
setTimeout(()=> {
    createAgent('Biba', '-35 -25', 'l', false)
},100)
setTimeout(()=> {
    createAgent('Biba', '-35 0', 'l', false)
},100)
setTimeout(()=> {
    createAgent('Biba',  '-35 25', 'l', false)
},100)
setTimeout(()=> {
    createAgent('Biba','-50 0','l', true)
},100)
setTimeout(()=> {
    createAgent('Boba', '10 0', 'r', false)
},100)
setTimeout(()=> {
    createAgent('Boba', '5 25', 'r', false)
},100)
setTimeout(()=> {
    createAgent('Boba', '5 -25', 'r', false)
},100)
setTimeout(()=> {
    createAgent('Boba', '15 -15', 'r', false)
},100)
setTimeout(()=> {
    createAgent('Boba', '15 15', 'r', false)
},100)
setTimeout(()=> {
    createAgent('Boba', '25 15', 'r', false)
},100)
setTimeout(()=> {
    createAgent('Boba', '25 -15', 'r', false)
},100)
setTimeout(()=> {
    createAgent('Boba', '35 -25', 'r', false)
},100)
setTimeout(()=> {
    createAgent('Boba','35 0', 'r', false)
},100)
setTimeout(()=> {
    createAgent('Boba','35 25', 'r', false)
},100)
setTimeout(()=> {
    createAgent('Boba', '50 0', 'r', true)
},100)