const Msg = require('./msg') // Подключение модуля разбора сообщений от сервера
const ctrlAttackerHigh = require('./controllerAttacker/ctrlAttackerHigh')
const ctrlAttackerMiddle = require('./controllerAttacker/ctrlAttackerMiddle')
const ctrlAttackerLow = require('./controllerAttacker/ctrlAttackerLow')
const ctrlGoalieHigh = require('./controllerGoalie/ctrlGoalieHigh')
const ctrlGoalieMiddle = require('./controllerGoalie/ctrlGoalieMiddle')
const ctrlGoalieLow = require('./controllerGoalie/ctrlGoalieLow')

// Подключение модуля ввода из командной строки
class Agent {
    constructor(teamName, position = "l") {
        this.position = position //"l" По умолчанию - левая половина поля
        this.teamName = teamName
        this.run = false // Игра начата
    }


    msgGot(msg) { // Получение сообщения
        let data = msg.toString('utf8') // Приведение к строке
        this.processMsg(data) // Разбор сообщения
        this.sendCmd() // Отправка команды
    }


    setSocket(socket) { // Настройка сокета
        this.socket = socket
    }


    socketSend(cmd, value) { // Отправка команды
        this.socket.sendMsg(`(${cmd} ${value})`)
    }


    processMsg(msg) { // Обработка сообщения
        let data = Msg.parseMsg(msg) // Разбор сообщения
        if (!data) throw new Error("Parse error\n" + msg)
        // Первое (hear) - начало игры
        if (data.cmd == "hear") {
            if (data.msg.includes('play_on') || data.msg.includes('kick_off_'))
                this.run = true
        }
        if (data.cmd == "init") this.initAgent(data.p) //Инициализация
        this.analyzeEnv(data.msg, data.cmd, data.p) // Обработка
    }


    initAgent(p) {
        if (p[0] == "r") this.position = "r" // Правая половина поля
        if (p[1]) this.id = p[1] // id игрока
    }


    analyzeEnv(msg, cmd, p) { // Анализ сообщения
        if (cmd === 'hear' && (p[2].includes('goal_l_') || p[2].includes('goal_r_'))) {
            switch(this.id) {
                case 1:
                    this.act = {n: "move", v: `-10 0`}
                    break;
                case 2:
                    this.act = {n: "move", v: `-5 -25`}
                    break;
                case 3:
                    this.act = {n: "move", v: `-5 25`}
                    break;
                case 4:
                    this.act = {n: "move", v: `-15 -15`}
                    break;
                case 5:
                    this.act = {n: "move", v: `-15 15`}
                    break;
                case 6:
                    this.act = {n: "move", v: `-27 30`}
                    break;
                case 7:
                    this.act = {n: "move", v: `-27 0`}
                    break;
                case 8:
                    this.act = {n: "move", v: `-27 -30`}
                    break;
                case 9:
                    this.act = {n: "move", v: `-35 13`}
                    break;
                case 10:
                    this.act = {n: "move", v: `-35 -13`}
                    break;
                case 11:
                    this.act = {n: "move", v: `-50 0`}
                    break;
            }
        }
        if (cmd === 'see' && this.run) {
            if (this.id < 11) {
                this.act = ctrlAttackerLow.execute(p, [ctrlAttackerMiddle, ctrlAttackerHigh], this.teamName, this.position, this.id)
            } else {
                this.act = ctrlGoalieLow.execute(p, [ctrlGoalieMiddle, ctrlGoalieHigh], this.teamName, this.position, this.id)
            }
        }
    }

    sendCmd() {
        if (this.run) { // Игра начата
            if (this.act) { // Есть команда от игрока
                // if (this.act.n == "kick") // Пнуть мяч
                if (this.act.n !== "move") // Пнуть мяч
                    this.socketSend(this.act.n, this.act.v)
                else // Движение и поворот
                    this.socketSend(this.act.n, this.act.v)
            }
            this.act = null // Сброс команды
        }
    }
}
module.exports = Agent // Экспорт игрока