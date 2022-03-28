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
        // console.log(goal, goal === 'p'
        //     ? Boolean(this.p.find(obj => obj.cmd && obj.cmd.p[0] === goal))
        //     : Boolean(this.p.find(obj => obj.cmd && obj.cmd.p.join('') === goal)));
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

    getFCNKGNormalDistance(coords) {
        return coords ? Math.sqrt(coords.x**2 + coords.y**2) : null
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
    },
    getPlayerPos(teamName) {
        const flags = this.p.filter((obj) => obj.cmd && (obj.cmd.p[0] === 'f' || obj.cmd.p[0] === 'g'))
        // console.log(teamName)
        const player = this.p.find((obj) => obj.cmd && (obj.cmd.p[0] === 'p') && obj.cmd.p[1] === `"${teamName}"`)
        const newFlags = location.getFlagsFromObject(player, flags)
        // console.log(location.orientationWithThreeFlag(...newFlags))
        return location.orientationWithThreeFlag(...newFlags)
    },
    getAngleToPass(playerPos) {
        const xNegative = playerPos[0].pos.x<playerPos[1].pos.x? 1:-1;
        const yNegative = playerPos[0].pos.y<playerPos[1].pos.y? 1:-1;


        const dx = Math.abs(playerPos[1].pos.x-playerPos[0].pos.x);
        const dy = Math.abs(playerPos[1].pos.y-playerPos[0].pos.y);
        const xMulti = dx<0.02? 60:dx<0.5 ? 25 : dx < 8 ? 3 : 1;
        const yMulti = dy<0.02? 60:dy<0.5 ? 25 : dy < 8 ? 3 : 1;
        // const yMulti = dy<0.3?15:5;

        const newPos = {
            x: playerPos[1].pos.x + dx * xNegative * xMulti,
            y: playerPos[1].pos.y + dy * yNegative * yMulti,
        }
        console.log(playerPos[0]);
        console.log(playerPos[1]);
        // console.log(newPos);

        // dy 0.3
        // dy 3             3
        // dy 10

        //  0.5      5          10



        const ax= playerPos[1].pos.x;
        const ay= playerPos[1].pos.y;
        const bx= newPos.x;
        const by= newPos.y;

        //
        const cosAngle1 = (ax*bx + ay*by)/(Math.sqrt(ax**2+ay**2)*Math.sqrt(bx**2+by**2));
        const angle = Math.acos(cosAngle1) * 180 / Math.PI;
        console.log({pos:newPos, angle});
        console.log(dx, dy);
        const cosAngle = (playerPos[1].pos.x*newPos.x + playerPos[1].pos.y*newPos.y)
            / (Math.sqrt(playerPos[1].pos.x**2 + playerPos[1].pos.y**2)
                * Math.sqrt(newPos.x**2 + newPos.y**2))
        const newAngle = Math.acos(cosAngle) * 180 / Math.PI
        return (playerPos[1].angle > playerPos[0].angle)
            ? playerPos[1].angle + angle : playerPos[1].angle - angle
    },
}
