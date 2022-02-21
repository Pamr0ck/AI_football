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
    flt30: {x: -57.5, y: 30}, flt20: {x: -57.5, y: 20},
    flt10: {x: -57.5, y: 10}, fl0: {x: -57.5, y: 0},
    flb10: {x: -57.5, y: -10}, flb20: {x: -57.5, y: -20},
    flb30: {x: -57.5, y: -30}, frt30: {x: 57.5, y: 30},
    frt20: {x: 57.5, y: 20}, frt10: {x: 57.5, y: 10},
    fr0: {x: 57.5, y: 0}, frb10: {x: 57.5, y: -10},
    frb20: {x: 57.5, y: -20}, frb30: {x: 57.5, y: -30},
    fglt: {x: -52.5, y: 7.01}, fglb: {x: -52.5, y: -7.01},
    gl: {x: -52.5, y: 0}, gr: {x: 52.5, y: 0}, fc: {x: 0, y: 0},
    fplt: {x: -36, y: 20.15}, fplc: {x: -36, y: 0},
    fplb: {x: -36, y: -20.15}, fgrt: {x: 52.5, y: 7.01},
    fgrb: {x: 52.5, y: -7.01}, fprt: {x: 36, y: 20.15},
    fprc: {x: 36, y: 0}, fprb: {x: 36, y: -20.15},
    flt: {x: -52.5, y: 34}, fct: {x: 0, y: 34},
    frt: {x: 52.5, y: 34}, flb: {x: -52.5, y: -34},
    fcb: {x: 0, y: -34}, frb: {x: 52.5, y: -34},
    distance(p1, p2) {
        return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)
    },
}

const parseFlagFromArray = (flagArray) => {
    return flagArray.reduce((acc, curr) => acc + curr, '')
}

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
            if (visibleFlags.length >= 3) {
                coords = this.orientationWithThreeFlag(visibleFlags[0],visibleFlags[1],visibleFlags[2])
            } else if (visibleFlags.length === 2) {
                coords = this.orientationWithTwoFlag(visibleFlags[0], visibleFlags[1])
            } else if (visibleFlags.length === 1) {
                coords = this.orientationWithOneFlag(visibleFlags[0]);
            }

            this.coords = coords;
            console.log(this.teamName, 'my coords:', coords?.x, coords?.y);

            visiblePlayers.forEach((player)=>{
                let coords = this.orientationWithThreeFlag(...this.getFlagsFromObject(player, visibleFlags.slice(1)));
                coords.x = -coords.x

                console.log('Other player coords:', coords.x, coords.y);
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


    orientationWithOneFlag(flag) {
        const dist = flag.p[0];
        const angle = flag.p[1] + this.sense_body.turn[0];
        const flag_coord = Flags[parseFlagFromArray(flag.cmd.p)];

        const loc_x = dist * Math.cos(angle * Math.PI / 180);
        const loc_y = dist * Math.sin(angle * Math.PI / 180);


        // TODO if r then minus flagcoord
        const x = this.position === 'l'? flag_coord.x - loc_x: flag_coord.x + loc_x ;
        const y = -flag_coord.y - loc_y;

        return {x, y};
    }

    orientationWithTwoFlag(flag1, flag2) {
        const {x:x1, y:y1} = Flags[parseFlagFromArray(flag1.cmd.p)]?Flags[parseFlagFromArray(flag1.cmd.p)]:{x: flag1.p[0], y: flag2.p[1]};
        const {x:x2, y:y2} = Flags[parseFlagFromArray(flag2.cmd.p)];
        const d1 = flag1.p[0]
        const d2 = flag2.p[0]

        const alpha = (y1 - y2) / (x2 - x1)
        const beta = (y2 ** 2 - y1 ** 2 + x2 ** 2 - x1 ** 2 + d1 ** 2 - d2 ** 2) /
            (2 * (x2 - x1))

        let x, y, a, b, c;

        a = alpha ** 2 + 1
        b = -2 * (alpha * (x1 - beta) + y1)
        c = (x1 - beta) ** 2 + y1 ** 2 - d1 ** 2
        let D = b ** 2 - 4 * a * c
        let result = {x:null, y:null};
        if (x1 === x2) {
            return this.whenXSame([{x:x1,y:y1,d:d1},{x:x2,y:y2,d:d2}], 0, 1)
        } else {
            result.y = (-b + Math.sqrt(D))/(2*a)
            if (result.y >= 34  || result.y <= - 34) {
                result.y = (-b - Math.sqrt(D))/(2*a)
            }

        }
        if (y1 === y2) {
            return this.whenYSame([{x:x1,y:y1,d:d1},{x:x2,y:y2,d:d2}], 0, 1)
        } else {
            result.x = x1 + Math.sqrt(d1 ** 2 - (y - y1) ** 2)
            if (result.x >= 54  || result.x <= -55) {
                result.x = x1 - Math.sqrt(d1 ** 2 - (y - y1) ** 2)
            }
        }
        // x = -x
        // y = -y
        // return {x, y}
        return result
    }


    orientationWithThreeFlag(flag1, flag2, flag3) {
        const {x:x1, y:y1} = Flags[parseFlagFromArray(flag1.cmd.p)]?Flags[parseFlagFromArray(flag1.cmd.p)]:{x: flag1.p[0], y: flag2.p[1]};
        const {x:x2, y:y2} = Flags[parseFlagFromArray(flag2.cmd.p)];
        const {x:x3, y:y3} = Flags[parseFlagFromArray(flag3.cmd.p)];
        const d1 = flag1.p[0];
        const d2 = flag2.p[0];
        const d3 = flag3.p[0];

        let answer = undefined;

        if(x1 === x2){
            answer = this.whenXSame([{x:x1,y:y1,d:d1},{x:x2,y:y2,d:d2}, {x:x3,y:y3,d:d3}], 0, 1, 2)
        } else if (x1===x3){
            answer = this.whenXSame([{x:x1,y:y1,d:d1},{x:x2,y:y2,d:d2}, {x:x3,y:y3,d:d3}], 0, 2, 1);
        } else if (x2===x3){
            answer = this.whenXSame([{x:x1,y:y1,d:d1},{x:x2,y:y2,d:d2}, {x:x3,y:y3,d:d3}], 1, 2, 0)
        }else if (y1===y2){
            answer = this.whenYSame([{x:x1,y:y1,d:d1},{x:x2,y:y2,d:d2}, {x:x3,y:y3,d:d3}], 0, 1, 2)
        } else if (y1===y3) {
            answer = this.whenYSame([{x:x1,y:y1,d:d1},{x:x2,y:y2,d:d2}, {x:x3,y:y3,d:d3}], 0, 2, 1);
        } else if (y2===y3){
            answer = this.whenYSame([{x:x1,y:y1,d:d1},{x:x2,y:y2,d:d2}, {x:x3,y:y3,d:d3}], 1, 2, 0)
        }
        else {
            const alpha1 = (y1 - y2) / (x2 - x1)
            const alpha2 = (y1 - y3) / (x3 - x1)

            const beta1 = (y2 ** 2 - y1 ** 2 + x2 ** 2 - x1 ** 2 + d1 ** 2 - d2 ** 2) /
                (2 * (x2 - x1))
            const beta2 = (y3 ** 2 - y1 ** 2 + x3 ** 2 - x1 ** 2 + d1 ** 2 - d3 ** 2) /
                (2 * (x3 - x1))

            const y = (beta1 - beta2) / (alpha2 - alpha1)
            const x = alpha1 * y + beta1

            answer = {x,y};
        }
        return answer;
    }

    getFlagsFromObject(object, flags){
        const result = [];
        result.push(object);
        flags.forEach((flag)=>{
            const d1 = object.p[0];
            const d2 = flag.p[0];
            const distanceBetweenObjectAndFlag = Math.sqrt(
                d1 ** 2 +
                d2 ** 2 -
                2 * d1 * d2 * Math.cos(Math.abs(object.p[1] - flag.p[1])*Math.PI/180)
            )
            const customFlag = flag;
            customFlag.p[0] = distanceBetweenObjectAndFlag;
            result.push(customFlag);
        });
        return result;
    }

    whenXSame(points, index1, index2, index3) {
        const y = ((points[index2].y)**2 - (points[index1].y)**2 + (points[index1].d)**2 - (points[index2].d)**2) / (2 * (points[index2].y - points[index1].y));
        const xs = [];
        xs.push(points[index1].x + Math.sqrt(Math.abs((points[index1].d)**2 - (y - points[index1].y)**2)));
        xs.push(points[index1].x - Math.sqrt(Math.abs((points[index1].d)**2 - (y - points[index1].y)**2)));
        let answer = null;
        if (index3) {
            const forX1 = Math.abs((xs[0] - points[index3].x)**2 + (y - points[index3].y)**2 - (points[index3].d)**2);
            const forX2 = Math.abs((xs[1] - points[index3].x)**2 + (y - points[index3].y)**2 - (points[index3].d)**2);
            if (forX1 - forX2 > 0) {
                answer = {x: xs[1], y}
            } else {
                answer = {x: xs[0], y}
            }
        } else {
            if (Math.abs(xs[0]) <= 54) {
                answer = {x: xs[0], y}
            } else {
                answer = {x: xs[1], y}
            }
        }
        return answer
    }

    whenYSame(points, index1, index2, index3) {
        const x = ((points[index2].x)**2 - (points[index1].x)**2 + (points[index1].d)**2 - (points[index2].d))**2 / (2 * (points[index2].x - points[index1].x));
        const ys = [];
        ys.push(points[index1].y + Math.sqrt(Math.abs((points[index1].d)**2 - (x - points[index1].x)**2)));
        ys.push(points[index1].y - Math.sqrt(Math.abs((points[index1].d)**2 - (x - points[index1].x)**2)));
        let answer = null;
        if (index3) {
            const forY1 = Math.abs((x - points[index3].x)**2 + (ys[0] - points[index3].y)**2 - (points[index3].d)**2);
            const forY2 = Math.abs((x - points[index3].x)**2 + (ys[1] - points[index3].y)**2 - (points[index3].d)**2);
            if (forY1 - forY2 > 0) {
                answer = {x, y: ys[1]}
            } else {
                answer = {x, y: ys[0]}
            }
        } else {
            if (Math.abs(ys[0]) <= 32) {
                answer = {x, y: ys[0]}
            } else {
                answer = {x, y: ys[1]}
            }
        }
        return answer
    }


}

module.exports = Agent // Экспорт игрока