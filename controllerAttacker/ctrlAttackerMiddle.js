const ctrlAttackMiddle = {
    action: "return",
    execute(input, controllers) {
        const next = controllers[0] // Следующий уровень
        switch (this.action) {
            case "return":
                input.cmd = this.actionReturnAttack(input)
                break
            case "seekBall":
                input.cmd = this.seekBall(input)
                break
        }
        input.action = this.action
        if(next) { // Вызов следующего уровня
            const command = next.execute(input, controllers.slice(1))
            if(command) return command
            if(input.newAction) this.action = input.newAction
            return input.cmd
        }
    },
    actionReturnAttack(input) { // Возврат к своим кт
        let goal = ''
        if (input.id === 1) {
            goal = (input.side === 'l') ? 'fprc' : 'fplc'
        } else if (input.id === 2) {
            goal = (input.side === 'l') ? 'fprt' : 'fplb'
        } else if (input.id === 3){
            goal = (input.side === 'l') ? 'fprb' : 'fplt'
        } else if (input.id < 6) {
            goal = 'fc'
        } else if (input.id === 6) {
            goal = (input.side === 'l') ?'fcb': 'fct'
        } else if (input.id === 7) {
            goal = (input.side === 'l') ?'fct': 'fcb'
        } else if (input.id === 8) {
            goal = (input.side === 'l') ? 'fplt' : 'fprb'
        } else if (input.id === 9) {
            goal = (input.side === 'l') ? 'fplc' : 'fprc'
        } else if (input.id === 10) {
            goal = (input.side === 'l') ? 'fplb' : 'fprt'
        }
        if(!input.flags[goal]) return {n: "turn", v: 60}
        if(Math.abs(input.flags[goal].angle) > 10)
            return {n: "turn", v: input.flags[goal].angle}
        if(input.flags[goal].dist > 3)
            return {n: "dash", v: 80}
        this.action = "seekBall"
        return {n: "turn", v: 180}
    },
    seekBall(input) { // Осмотр поля
        if (!input.ball)
            return {n: "turn", v: 45}
        else {
            return {n: "turn", v: input.ball.angle}
        }
    },
}
module.exports = ctrlAttackMiddle
