const Msg = require('./msg')
// Подключение модуля разбора сообщений от сервера
const readline = require('readline')

const orientation = require('./orientation')
// Подключение модуля ввода из командной строки
class Agent {
    constructor(teamName) {
        this.position = "l" // По умолчанию - левая половина поля
        this.run = false // Игра начата
        this.act = null // Действия
        this.play_on = false //
        this.teamName = teamName
        this.rl = readline.createInterface({ // Чтение консоли
            input: process.stdin,
            output: process.stdout
        })
        this.rl.on('line', (input) => { // Обработка строки из консоли
            if (this.run) { // Если игра начата
                // Движения вперед, вправо, влево, удар по мячу
                if ("w" == input) this.act = {n: "dash", v: 100}
                if ("d" == input) this.act = {n: "turn", v: 20}
                if ("a" == input) this.act = {n: "turn", v: -20}
                if ("s" == input) this.act = {n: "kick", v: 100}
            }
        })
        this.sense_body = {}
        this.coords = {}
        this.position = 'l';
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
        if (data.cmd === "hear")  {
            if (!this.run)
                if (data.p[1] === 'referee' && data.p[2] === 'play_on') {
                    this.play_on = true
                }
        }
        if (data.cmd === "init") this.initAgent(data.p)//Инициализация
        this.analyzeEnv(data.msg, data.cmd, data.p) // Обработка
    }

    initAgent(p) {
        if (p[0] == "r") this.position = "r" // Правая половина поля
        else if (p[0] == "l") this.position = "l" // Левая половина поля

        if (p[1]) this.id = p[1] // id игрока
    }

    // cmd === see||sense_body
    analyzeEnv(msg, cmd, p) { // Анализ сообщения

        if (cmd === 'sense_body') {
            for (const sense of p.filter(x => x.cmd)) {
                this.sense_body[sense.cmd] = sense.p;
            }
        }
        if (cmd === 'see') {
            const visibleFlags = p.filter(x => x.cmd && (x.cmd.p[0] === 'f' || x.cmd.p[0] === 'g'))
            const visiblePlayers = p.filter(x => x.cmd && (x.cmd.p[0] === 'p'))

            let coords = undefined;

            //TODO разобраться с NAN
            let uefa= 0;
            if (visibleFlags.length >= 3) {
                uefa= 3;
                coords = orientation.orientationWithThreeFlag(visibleFlags[0],visibleFlags[1],visibleFlags[2])
            } else if (visibleFlags.length === 2) {
                uefa= 2
                coords = orientation.orientationWithTwoFlag(visibleFlags[0], visibleFlags[1])
            } else if (visibleFlags.length === 1) {
                console.log('need more flags')
            }

            this.coords = coords;
            console.log(this.teamName, uefa, 'my coords:', coords?.x, coords?.y);

            visiblePlayers.forEach((player)=>{
                let coords = orientation.orientationWithThreeFlag(...orientation.getFlagsFromObject(player, visibleFlags.slice(1)));
                // coords.x = coords.x

                console.log('its ' + this.teamName + 'Other player coords:', coords.x, coords.y);
            })
        }
    }

    sendCmd() {
        if (this.run) { // Игра начата
            console.log('runned')
            if (this.act) { // Есть команда от игрока
                if (this.act.n == "kick") // Пнуть мяч
                    this.socketSend(this.act.n, this.act.v + " 0")
                else // Движение и поворот
                    this.socketSend(this.act.n, this.act.v)
            }
            this.act = null // Сброс команды
        }
    }

    speen(speed) {
        setInterval(() => {
            if (this.play_on) {
                this.socketSend("turn", `${speed}`)
            }
        }, 500)
    }





}

module.exports = Agent // Экспорт игрока