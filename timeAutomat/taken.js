const orientation = require('../orientation/orientation')

const Taken = {
    // state: {
    //     team: [], // команда противника
    //     teamOwn: [], // моя команда
    // },
    // setHear(input) {
    //     this.state.hear = input
    // },
    // getObjData(obj) {
    //     if (!obj) return undefined
    //     const objData = {
    //         f: obj.cmd.p.join('')
    //     }
    //     switch (obj.p.length) {
    //         case 1: objData.angle = obj.p[0]
    //         default:
    //             objData.dist = obj.p[0]
    //             objData.angle = obj.p[1]
    //     }
    //     return objData
    // },
    // setSee(input, team, side, id) {
    //     let ball = null
    //     const ballObj = input.find((obj) => obj.cmd && (obj.cmd.p[0] === 'b' || obj.cmd.p[0] === 'B'))
    //     if (ballObj) {
    //         ball = {
    //             dist: ballObj.p[0],
    //             angle: ballObj.p[1]
    //         }
    //     }
    //
    //     // команды
    //     this.state.teamOwn = input
    //         .filter(obj => obj.cmd && obj.cmd.p.includes(team))
    //         .map(obj => this.getObjData(obj))
    //
    //     this.state.teamEnemy = input
    //         .filter(obj => obj.cmd && obj.cmd.p[0] === 'p' && !obj.cmd.p.includes(team))
    //         .map(obj => this.getObjData(obj))
    //
    //     this.state.topFlagsCount = input.filter(obj => obj.cmd && obj.cmd.p[0] === 'f' && obj.cmd.p.includes('t')).length
    //     this.state.botFlagsCount = input.filter(obj => obj.cmd && obj.cmd.p[0] === 'f' && obj.cmd.p.includes('b')).length
    //
    //     //console.log(this.state)
    //
    //     return this.state
    // },
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