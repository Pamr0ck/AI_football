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
    setSee(input, team, side, id) {
        let ball = null
        const ballObj = input.find((obj) => obj.cmd && (obj.cmd.p[0] === 'b' || obj.cmd.p[0] === 'B'))
        if (ballObj) {
            ball = {
                dist: ballObj.p[0],
                angle: ballObj.p[1]
            }
        }
        const playersListAll = input.filter((obj) => obj.cmd && obj.cmd.p[0] === 'p')
        const playersListMy = input.filter((obj) => obj.cmd && obj.cmd.p[0] === 'p' && obj.cmd.p[1] === `"${team}"`)
        const playersListEnemy = input.filter((obj) => obj.cmd && obj.cmd.p[0] === 'p' && obj.cmd.p[1] !== `"${team}"`)
        //console.log(team, id)
        const flagsList = input.filter((obj) => obj.cmd && (obj.cmd.p[0] === 'f' || obj.cmd.p[0] === 'g'))
        let flags = {}
        input.forEach((fl) => {
            if (fl.cmd) {
                flags[fl.cmd.p.join('')] = {
                    dist: fl.p[0],
                    angle: fl.p[1]
                }
            }
        })
        let myPos = null
        if (flagsList.length === 2) {
            myPos = orientation.orientationWithTwoFlag(...flagsList.filter((p) => true))
        } else if (flagsList.length > 2){
            myPos = orientation.orientationWithThreeFlag(...flagsList.filter((p) => true))
        }
        //ворота
        const goalOwnTeam = input.find((obj) => obj.cmd && (obj.cmd.p.join('') === ((side === 'l') ? 'gl' : 'gr')))
        let goalOwn = (goalOwnTeam) ? {
            dist: goalOwnTeam.p[0],
            angle: goalOwnTeam.p[1]
        } : null
        // ворота
        const goalOtherTeam = input.find((obj) => obj.cmd && (obj.cmd.p.join('') === ((side === 'r') ? 'gl' : 'gr')))
        let goalOther = (goalOtherTeam) ? {
            dist: goalOtherTeam.p[0],
            angle: goalOtherTeam.p[1]
        } : null
        return {
            ball,
            flags,
            id,
            myPos,
            team,
            playersListMy,
            playersListEnemy,
            goalOther,
            goalOwn,
            side,
            closest(myTeam) {
                if (ball) {
                    if (flagsList.length < 2) {
                        // console.log('Мало флагов')
                    } else {
                        const distanceList = []
                        let playersList = []
                        if (myTeam === true) {
                            playersList = playersListMy
                        }else if (myTeam=== false){
                            playersList = playersListEnemy
                        }
                        else {
                            playersList = playersListAll
                        }
                        // console.log(playersList)
                        // p[1] - angle, p[0] distance, p.cmd.p[2]
                        playersList.forEach((p) => {
                            // console.log(p.cmd.p)
                            const newFlags = orientation.getFlagsFromObject(p, flagsList.filter((p) => true))
                            const playerCoords = orientation.orientationWithThreeFlag(...newFlags)
                            if (playerCoords) {
                                distanceList.push({
                                    coords: playerCoords,
                                    dist: Math.sqrt(ballObj.p[0]**2 + p.p[0]**2 - 2*ballObj.p[0]*p.p[0]*Math.cos((p.p[1] - ballObj.p[[1]])*Math.PI/ 180)),
                                    angle: p.p[1],
                                    id: p.cmd.p[2] ? p.cmd.p[2]: 99
                                })
                            }
                        })
                        distanceList.sort((dist1, dist2) => {
                            return dist1.dist - dist2.dist
                        })
                        return  distanceList
                    }
                }
                return []
            }
        }
    }
}


module.exports = Taken