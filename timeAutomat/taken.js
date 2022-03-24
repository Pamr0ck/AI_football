const orientation = require('../orientation/orientation')

const Taken = {
    state: {
        team: [], // команда противника
        teamOwn: [], // моя команда
    },
    setHear(input) {
        // TODO
    },
    getObjData(obj) {
        if (!obj) return undefined
        const objData = {
            f: obj.cmd.p.join('')
        }
        switch (obj.p.length) {
            case 1: objData.angle = obj.p[0]
            default:
                objData.dist = obj.p[0]
                objData.angle = obj.p[1]
        }
        return objData
    },
    setSee(input, team, side) {
        // время
        this.state.time = input[0]

        // мяч
        this.state.ball = this.getObjData(input.find(obj => obj.cmd && obj.cmd.p[0] === 'b'))

        // ворота
        let gr = this.getObjData(input.find(obj => obj.cmd && obj.cmd.p.join('') === 'gr'))
        let gl = this.getObjData(input.find(obj => obj.cmd && obj.cmd.p.join('') === 'gl'))
        this.state.goalOwn = side === 'l' ? gl : gr
        this.state.goal = side === 'l' ? gr : gl

        // флаги, чтобы оглядываться
        this.state.lookAroundFlags = {
            fprb: this.getObjData(input.find(obj => obj.cmd && obj.cmd.p.join('') === 'fprb')),
            fprc: this.getObjData(input.find(obj => obj.cmd && obj.cmd.p.join('') === 'fprc')),
            fprt: this.getObjData(input.find(obj => obj.cmd && obj.cmd.p.join('') === 'fprt'))
        }

        // команды
        this.state.teamOwn = input
            .filter(obj => obj.cmd && obj.cmd.p.includes(team))
            .map(obj => this.getObjData(obj))

        this.state.teamEnemy = input
            .filter(obj => obj.cmd && obj.cmd.p[0] === 'p' && !obj.cmd.p.includes(team))
            .map(obj => this.getObjData(obj))

        this.state.topFlagsCount = input.filter(obj => obj.cmd && obj.cmd.p[0] === 'f' && obj.cmd.p.includes('t')).length
        this.state.botFlagsCount = input.filter(obj => obj.cmd && obj.cmd.p[0] === 'f' && obj.cmd.p.includes('b')).length

        //console.log(this.state)

        return this.state
    },
    getMyPos(input) {
        const flags = input.filter(obj => obj.cmd && (obj.cmd.p[0] === 'f' || obj.cmd.p[0] === 'g'))
        if (flags.length >= 2) {
            let myPos = null
            if (flags.length === 2) {
                myPos = orientation.orientationWithTwoFlag(...flags)
            } else {
                myPos = orientation.orientationWithThreeFlag(...flags)
            }
            return myPos
        }
        return null
    },
}


module.exports = Taken