const FL = "flag", PS = "pass", ST= "stop", SAY = "say"
const TEAM = "biba"
const START_COORD = "-12 -10"
const NUMBER_GOAL_PLAYER = 2

const DT = {
    state: {
        next: 0,
        sequence: [
            {
                act: FL,
                fl: "fplc"
            },
            {
                act: PS,
                fl: "b"
            },
            {
                act: SAY,
                text: 'go',
            },
            {
                act: FL,
                fl: "fplc"
            },
            {
                act: ST
            }
        ],
        isGoal: false,
        teammateCoords:[],
        command: null,
        myCoords: {},
    },
    root: {
        exec(mgr, state) {
            state.action = state.sequence[state.next];
            state.command = null
        },
        next: "checkStop",
    },
    checkStop: {
        condition: (mgr,state) =>  state.action.act === ST,
        trueCond: "startOrStay",
        falseCond: "checkSay",
    },
    checkSay: {
        condition: (mgr,state) =>  state.action.act === SAY,
        trueCond: "say",
        falseCond: "goalVisible",
    },
    say: {
        exec(mgr, state) {
            state.command = {
                n: "say",
                v: state.action.text
            }
            state.next++
            state.action = state.sequence[state.next]
        },
        next: "sendCommand",
    },
    startOrStay: {
        condition: (mgr,state) =>  state.isGoal,
        trueCond: "goToStart",
        falseCond: "sendCommand",
    },
    goToStart: {
        exec(mgr, state) {
            state.command = {
                n: "move",
                v: START_COORD
            }
        },
        next: "sendCommand",
    },
    goalVisible: {
        condition: (mgr, state) => mgr.getVisible(state.action.fl),
        trueCond: "rootNext",
        falseCond: "rotate",
    },
    rotate: {
        exec(mgr, state) {
            state.command = {
                n: "turn",
                v: "45"
            }
        },
        next: "sendCommand",
    },
    rootNext: {
        condition: (mgr, state) => state.action.act === FL,
        trueCond: "flagSeek",
        falseCond: "ballSeek",
    },
    flagSeek: {
        condition: (mgr, state) => 3 > mgr.getDistance(state.action.fl),
        trueCond: "closeFlag",
        falseCond: "farGoal",
    },
    closeFlag: {
        exec(mgr, state) {
            state.next++
            state.action = state.sequence[state.next]
        },
        //next: "rootNext",
        next: "root",
    },
    farGoal: {
        condition: (mgr, state) => mgr.getAngle(state.action.fl) > 3,
        trueCond: "rotateToGoal",
        falseCond: "runToGoal",
    },
    rotateToGoal: {
        exec(mgr, state) {
            state.command = {
                n: "turn",
                v: mgr.getAngle(state.action.fl)
            }
            // console.log("ROTATE")
        },
        next: "sendCommand",
    },
    runToGoal: {
        exec(mgr, state) {
            state.command = {
                n: "dash",
                v: 60
            }
            // console.log("RUN")
        },
        next: "sendCommand",
    },
    ballSeek: {
        condition: (mgr, state) => 1 > mgr.getDistance(state.action.fl),
        trueCond: "closeBall",
        falseCond: "farGoal",
    },
    closeBall: {
        condition: (mgr, state) => mgr.getVisible(`p"${TEAM}"`) || mgr.getVisible(`p"${TEAM}"${NUMBER_GOAL_PLAYER}`),
        trueCond: "checkPlayerCoords",
        falseCond: "playerInvisible",
    },
    checkPlayerCoords: {
        condition: (mgr, state) => state.teammateCoords.length > 1,
        trueCond: "kick",
        falseCond: "updateTeammateCoords",
    },
    updateTeammateCoords: {
        exec(mgr, state) {
            console.log('сохраняю, я молодец')
            state.teammateCoords.push({
                pos: mgr.getPlayerPos(TEAM),
                angle: mgr.getAngle(`p"${TEAM}"`) === null ? mgr.getAngle(`p"${TEAM}"${NUMBER_GOAL_PLAYER}`) : mgr.getAngle(`p"${TEAM}"`)
            })
        },
        next: "sendCommand",
    },
    kick: {
        exec(mgr, state) {
            const angle = mgr.getAngleToPass(state.teammateCoords)
            const power = mgr.getFCNKGNormalDistance(state.teammateCoords[state.teammateCoords.length-1].pos)*3 + 50;
            console.log(mgr.getFCNKGNormalDistance(state.teammateCoords[state.teammateCoords.length-1].pos));

            state.command = {
                n: "kick",
                //v: `90 ${mgr.getAngle(`p"${TEAM}"`) === null ? mgr.getAngle(`p"${TEAM}"${NUMBER_GOAL_PLAYER}`) : mgr.getAngle(`p"${TEAM}"`)}`
                v: `${power} ${angle}`
            }
            state.teammateCoords = []
            state.next++
            state.action = state.sequence[state.next]
        },
        next: "sendCommand",
    },
    playerInvisible: {
        exec(mgr, state) {
            // console.log("INVIS")
            // console.log(mgr.getVisible(`p"${TEAM}"`))
            state.command = {
                n: "kick",
                v: "10 45"
            }
        },
        next: "sendCommand",
    },
    sendCommand: {
        command: (mgr, state) => state.command
    },
}
module.exports = DT
