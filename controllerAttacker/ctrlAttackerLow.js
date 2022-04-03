const Taken = require('../timeAutomat/taken')
const ctrlAttackLow = {
    execute(input, controllers, team, side, id) {
        const next = controllers[0] // Следующий уровень
        this.taken = Taken.setSee(input, team, side, id)
        if(this.taken.ball && this.taken.ball.dist < 1) // Мяч рядом
            this.taken.canKick = true
        else
            this.taken.canKick = false
        if(next) // Вызов следующего уровня
            return next.execute(this.taken, controllers.slice(1))
    }
}

module.exports = ctrlAttackLow
