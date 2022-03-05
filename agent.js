const Msg = require('./msg') // Подключение модуля разбора сообщений от сервера
const DecisionTreeManager = require('./trees/treeManager')
const flag_dt = require('./trees/movementTree')
const twoPlayersDT = require('./trees/twoPlayerTree')
const goalie_dt = require('./trees/goalkeeper')

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
            if (data.msg.includes('play_on'))
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
        if (cmd === 'see' && this.run) {
            if (this.position === 'l' && this.id === 1) {
                this.act = DecisionTreeManager.getAction(flag_dt, p)
            }
            else if (this.position === 'l' && this.id === 2) {
                const dt = Object.assign({}, twoPlayersDT)
                dt.state.leader = `p"${this.teamName}"1`
                dt.state.turn = 'l'
                this.act = DecisionTreeManager.getAction(dt, p)
            } else if (this.position === 'l' && this.id === 3) {
                const dt = Object.assign({}, twoPlayersDT)
                dt.state.leader = `p"${this.teamName}"1`
                dt.state.turn = 'r'
                this.act = DecisionTreeManager.getAction(dt, p)
            } else if (this.position === 'r' && this.id === 1) {
                this.act = DecisionTreeManager.getAction(goalie_dt, p)
            }
        }
    }

    sendCmd() {
        if (this.run) { // Игра начата
            if (this.act) { // Есть команда от игрока
                if (this.act.n == "kick") // Пнуть мяч
                    this.socketSend(this.act.n, this.act.v)
                else // Движение и поворот
                    this.socketSend(this.act.n, this.act.v)
            }
            this.act = null // Сброс команды
        }
    }
}
module.exports = Agent // Экспорт игрока