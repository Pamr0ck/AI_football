const Agent = require('./agent') // Импорт агента

const VERSION = 7 // Версия сервера
let teamName = "teamA" // Имя команды
let agent = new Agent(); // Создание экземпляра агента
require('./socket')(agent, teamName, VERSION) //Настройка сокета
agent.socketSend("move", `-1 0`) // Размещение игрока на поле
// agent.socketSend('kick', '100 100')
