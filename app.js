const Agent = require('./agent') // Импорт агента
const readline = require('readline')
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const VERSION = 7 // Версия сервера
// agent.socketSend('kick', '100 100')

function createAgent(teamName, x, y) {
    let agent = new Agent(teamName)
    require('./socket')(agent, teamName, VERSION) //Настройка сокета
    agent.socketSend("move", `${x} ${y}`) // Размещение игрока на поле
    return agent
}

function getData() {
    rl.question("Введите координату X вашего игрока:", (x) => {
        rl.question("Введите координату Y вашего игрока:", (y) => {
            rl.question("Название вашей команды:", (teamName) => {
                rl.question("скорость поворота:", (speed) => {
                    rl.question("Введите координату X противника:", (x_p) => {
                        rl.question("Введите координату Y противника:", (y_p) => {
                            rl.question("Название вашей команды противника:", (teamName_p) => {
                                agent1 = createAgent(teamName, x, y)
                                agent2 = createAgent(teamName_p, x_p, y_p)

                                agent1.speen(speed)
                            })
                        })
                    })

                })
            })
        })
    })
}

getData()