const Msg = require('./msg')
// Подключение модуля разбора сообщений от сервера
const readline = require('readline')

const orientation = require('./orientation/orientation')
const goalkeeperTree = require('./trees/goalkeeper/goalkeeperDecisionTree')
const playerTree = require('./trees/player/tandemThree')


// Подключение модуля ввода из командной строки
class Agent {
    constructor(goalkeeper) {
        this.side = "l";
        this.run = false;
        if( goalkeeper === 'y' )
        {
            this.goalie = true;
            this.side = 'r';
        }
        else
            this.goalie = false;
    }

    init(teamName, version) {
        if( this.goalie )
            this.socket.sendMsg(`(init ${teamName} (version ${version}) (goalie))`);
        else
            this.socket.sendMsg(`(init ${teamName} (version ${version}))`);
        this.teamName = teamName;
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
        if (data.cmd === "hear") {
            if (data.p[1] === 'referee' && data.p[2] === 'play_on') {
                this.run = true
            }
            if (data.msg.includes('goal')) {
                this.flagNum = 0
                this.run = false
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
        // if (cmd === 'see' && this.run) {
        //     this.getAction(p)
        // }

        if( this.goalie ) {
            this.act = goalkeeperTree.getAction(p, this.side);
        }
        else {
            this.act = playerTree.getAction(p, this.teamName);
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


    // getAction(p) {
    //     this.isSeeBall(p);
    // }
    //
    // isSeeBall(p) {
    //     const ball = p.filter(
    //         (obj) => obj.cmd && obj.cmd.p[0] === 'b')[0];
    //
    //     if (ball) {
    //         this.isBallFrontMe(ball, p);
    //     } else {
    //         this.act = {n: "turn", v: "80"};
    //     }
    // }


    // isBallFrontMe(ball, p) {
    //     if (ball.p[1] < 0.5) { // это угол
    //         this.isBallNear(ball, p);
    //     } else {
    //         this.act = {n: "turn", v: ball.p[1]};
    //     }
    // }
    //
    // isBallNear(ball, p) {
    //     if (ball.p[0] < 1) {
    //         this.isTargetSeeable(ball, p);
    //     } else {
    //         this.act = {n: "dash", v: `80`};
    //     }
    // }
    //
    // isTargetSeeable(ball, p) {
    //     const currentTarget = p.filter((obj) => obj.cmd && obj.cmd.p.join('') === this.flags[this.flagNum])[0];
    //     if( currentTarget )
    //     {
    //         console.log(currentTarget[this.flagNum]);
    //         this.isBallNearTarget(ball, currentTarget);
    //     }
    //     else{
    //         console.log('kick 15 80', currentTarget?.[0]);
    //         this.act = {n: "kick", v: `15 80`};
    //     }
    // }
    //
    // isBallNearTarget(ball, target){
    //     console.log(ball.p[0] - target.p[0]);
    //     if( Math.abs(ball.p[0] - target.p[0]) < 3 )
    //     {
    //         this.flagNum += 1;
    //     }
    //     else {
    //         console.log('kick', target, target?.p, target.cmd?.p?.[0]==='g');
    //         this.act = {n: "kick", v: `${target.cmd?.p?.[0]==='g'?'60':target.p[0]} ${target.p[1]}`};
    //     }
    // }

}

module.exports = Agent // Экспорт игрока