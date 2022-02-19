const Msg = require('./msg')
// Подключение модуля разбора сообщений от сервера
const readline = require('readline')


const Flags = {
    ftl50: {x: -50, y: 39}, ftl40: {x: -40, y: 39},
    ftl30: {x: -30, y: 39}, ftl20: {x: -20, y: 39},
    ftl10: {x: -10, y: 39}, ft0: {x: 0, y: 39},
    ftr10: {x: 10, y: 39}, ftr20: {x: 20, y: 39},
    ftr30: {x: 30, y: 39}, ftr40: {x: 40, y: 39},
    ftr50: {x: 50, y: 39}, fbl50: {x: -50, y: -39},
    fbl40: {x: -40, y: -39}, fbl30: {x: -30, y: -39},
    fbl20: {x: -20, y: -39}, fbl10: {x: -10, y: -39},
    fb0: {x: 0, y: -39}, fbr10: {x: 10, y: -39},
    fbr20: {x: 20, y: -39}, fbr30: {x: 30, y: -39},
    fbr40: {x: 40, y: -39}, fbr50: {x: 50, y: -39},
    flt30: {x:-57.5, y: 30}, flt20: {x:-57.5, y: 20},
    flt10: {x:-57.5, y: 10}, fl0: {x:-57.5, y: 0},
    flb10: {x:-57.5, y: -10}, flb20: {x:-57.5, y: -20},
    flb30: {x:-57.5, y: -30}, frt30: {x: 57.5, y: 30},
    frt20: {x: 57.5, y: 20}, frt10: {x: 57.5, y: 10},
    fr0: {x: 57.5, y: 0}, frb10: {x: 57.5, y: -10},
    frb20: {x: 57.5, y: -20}, frb30: {x: 57.5, y: -30},
    fglt: {x:-52.5, y: 7.01}, fglb: {x:-52.5, y:-7.01},
    gl: {x:-52.5, y: 0}, gr: {x: 52.5, y: 0}, fc: {x: 0, y: 0},
    fplt: {x: -36, y: 20.15}, fplc: {x: -36, y: 0},
    fplb: {x: -36, y:-20.15}, fgrt: {x: 52.5, y: 7.01},
    fgrb: {x: 52.5, y:-7.01}, fprt: {x: 36, y: 20.15},
    fprc: {x: 36, y: 0}, fprb: {x: 36, y:-20.15},
    flt: {x:-52.5, y: 34}, fct: {x: 0, y: 34},
    frt: {x: 52.5, y: 34}, flb: {x:-52.5, y: -34},
    fcb: {x: 0, y: -34}, frb: {x: 52.5, y: -34},
    distance(p1, p2) {
        return Math.sqrt((p1.x-p2.x)**2+(p1.y-p2.y)**2)
    },
}

const parseFlagFromArray = (flagArray) => {
    return flagArray.reduce((acc, curr)=> acc + curr ,'')
}

// Подключение модуля ввода из командной строки
class Agent {
    constructor() {
        this.position = "l" // По умолчанию - левая половина поля
        this.run = false // Игра начата
        this.act = null // Действия
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
        if (data.cmd == "hear") this.run = true
        if (data.cmd == "init") this.initAgent(data.p)//Инициализация
        this.analyzeEnv(data.msg, data.cmd, data.p) // Обработка
    }

    initAgent(p) {
        if (p[0] == "r") this.position = "r" // Правая половина поля
        if (p[1]) this.id = p[1] // id игрока
    }

    // cmd === see||sense_body
    analyzeEnv(msg, cmd, p) { // Анализ сообщения

        if (cmd === 'sense_body') {
            for (const sense of p.filter(x=>x.cmd)){
                this.sense_body[sense.cmd] = sense.p;
            }
        }

        if (cmd === 'see') {
            const visibleFlags = p.filter(x => x.cmd && (x.cmd.p[0] === 'f' || x.cmd.p[0] === 'g'))
            // console.log(`msg - ${msg}\n p - ${p}\n`)
            if (visibleFlags > 3) {

            } else if (visibleFlags.length === 2) {
                const flagName =  parseFlagFromArray(visibleFlags[0].cmd.p);
                console.log(Flags[flagName]);
                const point1 = Flags[flagName];
                const flagName2 =  parseFlagFromArray(visibleFlags[1].cmd.p);
                const point2 = Flags[flagName];
            } else if (visibleFlags.length === 1) {
            //    x = flag.x - point.x
            }
        }
    }

    sendCmd() {
        if (this.run) { // Игра начата
            if (this.act) { // Есть команда от игрока
                if (this.act.n == "kick") // Пнуть мяч
                    this.socketSend(this.act.n, this.act.v + " 0")
                else // Движение и поворот
                    this.socketSend(this.act.n, this.act.v)
            }
            this.act = null // Сброс команды
        }
    }

    orientationWithOneFlag(flag) {

    }
}

module.exports = Agent // Экспорт игрока