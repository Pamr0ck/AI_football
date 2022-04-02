const Taken = require('../timeAutomat/taken')
const CTRL_LOW = {
    execute(input, controllers, team, side) {
        const next = controllers[0] // Следующий уровень
        this.taken = Taken.setSee(input, team, side)
        if(this.taken.ball && this.taken.ball.dist < 0.5 && Math.abs(this.taken.myPos.x) > 35) // Мяч рядом
            this.taken.canKick = true
        else
            this.taken.canKick = false
        if(this.taken.ball && this.taken.myPos && this.taken.ball.dist < 1.2 && Math.abs(this.taken.myPos.x) > 35
            && Math.abs(this.taken.myPos.y) < 18) // Мяч рядом
            this.taken.canCatch = true
        else
            this.taken.canCatch = false
        if(next) // Вызов следующего уровня
            return next.execute(this.taken, controllers.slice(1))
    }
}

module.exports = CTRL_LOW
