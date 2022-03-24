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
        // return goal === 'p'
        //     ? Boolean(this.p.find(obj => obj.cmd && obj.cmd.p[0] === goal))
        //     : Boolean(this.p.find(obj => obj.cmd && obj.cmd.p.join('') === goal))
        if (typeof goal === 'object') {
            let p = this.p.find(obj => obj.cmd && obj.cmd.p[0] === goal[0] && obj.cmd.p[1] === goal[1])
            if (!p) p = this.p.find(obj => obj.cmd && obj.cmd.p[0] === goal[0])
            return Boolean(p)
        }
        return Boolean(this.p.find(obj => obj.cmd && obj.cmd.p.join('') === goal))
    },
    getDistance(goal) {
        // const goalObj = goal === 'p'
        //     ? this.p.find(obj => obj.cmd && obj.cmd.p[0] === goal)
        //     : this.p.find(obj => obj.cmd && obj.cmd.p.join('') === goal)
        // return goalObj && goalObj.p.length > 1 ? goalObj.p[0] : null
        let goalObj
        if (typeof goal === 'object') {
            goalObj = this.p.find(obj => obj.cmd && obj.cmd.p[0] === goal[0] && obj.cmd.p[1] === goal[1])
            if (!goalObj) goalObj = this.p.find(obj => obj.cmd && obj.cmd.p[0] === goal[0])
        } else {
            goalObj = this.p.find(obj => obj.cmd && obj.cmd.p.join('') === goal)
        }
        return goalObj && goalObj.p.length > 1 ? goalObj.p[0] : null
    },
    getAngle(goal) {
        // const goalObj = goal === 'p'
        //     ? this.p.find(obj => obj.cmd && obj.cmd.p[0] === goal)
        //     : this.p.find(obj => obj.cmd && obj.cmd.p.join('') === goal)
        // return goalObj ? (goalObj.p.length === 1 ? goalObj.p[0] : goalObj.p[1]) : null
        let goalObj
        if (typeof goal === 'object') {
            goalObj = this.p.find(obj => obj.cmd && obj.cmd.p[0] === goal[0] && obj.cmd.p[1] === goal[1])
            if (!goalObj) goalObj = this.p.find(obj => obj.cmd && obj.cmd.p[0] === goal[0])
        } else {
            goalObj = this.p.find(obj => obj.cmd && obj.cmd.p.join('') === goal)
        }

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
    },
    getPlayerPos(teamName) {
        const flags = this.p.filter((obj) => obj.cmd && (obj.cmd.p[0] === 'f' || obj.cmd.p[0] === 'g'))
        console.log(teamName)
        const player = this.p.find((obj) => obj.cmd && (obj.cmd.p[0] === 'p') && obj.cmd.p[1] === `"${teamName}"`)
        const newFlags = location.getFlagsFromObject(player, flags)
        console.log(location.orientationWithThreeFlag(...newFlags))
        return location.orientationWithThreeFlag(...newFlags)
    },
    getAngleToPass(playerPos) {
        console.log(playerPos)
        const newPos = {
            x: playerPos[1].pos.x + 18*(playerPos[1].pos.x - playerPos[0].pos.x),
            y: playerPos[1].pos.y + 18*(playerPos[1].pos.y - playerPos[0].pos.y)
        }
        const cosAngle = (playerPos[1].pos.x*newPos.x + playerPos[1].pos.y*newPos.y)
            / (Math.sqrt(playerPos[1].pos.x**2 + playerPos[1].pos.y**2)
                * Math.sqrt(newPos.x**2 + newPos.y**2))
        const newAngle = Math.acos(cosAngle) * 180 / Math.PI
        return (playerPos[1].angle > playerPos[0].angle)
            ? playerPos[1].angle + newAngle : playerPos[1].angle - newAngle
    },
}
