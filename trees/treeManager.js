const location = require('../orientation/orientation')

module.exports = {
    getAction(dt, p) {
        this.p = p
        function execute(dt, title, Manager) {
            const action = dt[title]
            if (typeof action.exec == "function") {
                action.exec(Manager, dt.state)
                return execute(dt, action.next, Manager)
            }
            if (typeof action.condition == "function") {
                const cond = action.condition(Manager, dt.state)
                if (cond) return execute(dt, action.trueCond, Manager)
                return execute(dt, action.falseCond, Manager)
            }
            if (typeof action.command == "function") {
                return action.command(Manager, dt.state)
            }
            throw new Error(`Unexpected node in DT: ${title}`)
        }
        return execute(dt, "root", this)
    },
    getVisible(goal) {
        return goal === 'p'
            ? Boolean(this.p.find(obj => obj.cmd && obj.cmd.p[0] === goal))
            : Boolean(this.p.find(obj => obj.cmd && obj.cmd.p.join('') === goal))
    },
    getDistance(goal) {
        const goalObj = goal === 'p'
            ? this.p.find(obj => obj.cmd && obj.cmd.p[0] === goal)
            : this.p.find(obj => obj.cmd && obj.cmd.p.join('') === goal)
        return goalObj && goalObj.p.length > 1 ? goalObj.p[0] : null
    },
    getAngle(goal) {
        const goalObj = goal === 'p'
            ? this.p.find(obj => obj.cmd && obj.cmd.p[0] === goal)
            : this.p.find(obj => obj.cmd && obj.cmd.p.join('') === goal)
        return goalObj ? (goalObj.p.length === 1 ? goalObj.p[0] : goalObj.p[1]) : null
    },
    getMyPos() {
        const flags = this.p.filter((obj) => obj.cmd && (obj.cmd.p[0] === 'f' || obj.cmd.p[0] === 'g'))
        if (flags.length >= 2) {
            let myPos = null
            if (flags.length === 2) {
                myPos = location.orientationWithTwoFlag(...flags)
            } else {
                myPos = location.orientationWithThreeFlag(...flags)
            }
            return myPos
        }
        return null
    }
}
