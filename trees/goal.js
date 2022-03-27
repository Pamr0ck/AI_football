const FL = "flag", RN = "run", KI= "kick"
const START_COORD = "-25 10"

const DT = {
    state: {
        next: 0,
        sequence: [
            {
                act: FL,
                fl: "fplb"
            },
            {
                act: FL,
                fl: "fgrb"
            },
            {
                act: KI,
                fl: "b",
                goal: "gr"
            }
        ],
        isGoal: false,
        isHeardGo: false,
        command: null
    },
    root: {
        exec(mgr, state) {
            state.action = state.sequence[state.next];
            state.command = null
        },
        next: "startOrPlay",
    },
    startOrPlay: {
        condition: (mgr,state) =>  state.isGoal,
        trueCond: "goToStart",
        falseCond: "goalVisible",
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
        trueCond: "flagOrRun",
        falseCond: "ballSeek",
    },
    stopRunning: {
        exec(mgr, state) {
            while (state.action.act !== KI) {
                state.next++
                state.action = state.sequence[state.next]
            }
        },
        next: "rootNext",
    },
    flagOrRun: {
        condition: (mgr, state) => state.isHeardGo && mgr.getVisible('b'),
        trueCond: "stopRunning",
        falseCond: "flagSeek",
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
        condition: (mgr, state) => mgr.getAngle(state.action.fl) > 4,
        trueCond: "rotateToGoal",
        falseCond: "runToGoal",
    },
    rotateToGoal: {
        exec(mgr, state) {
            state.command = {
                n: "turn",
                v: mgr.getAngle(state.action.fl)
            }
        },
        next: "sendCommand",
    },
    runToGoal: {
        exec(mgr, state) {
            state.command = {
                n: "dash",
                v: 70
            }
        },
        next: "sendCommand",
    },
    sendCommand: {
        command: (mgr, state) => state.command
    },
    ballSeek: {
        condition: (mgr, state) => 0.5 > mgr.getDistance(state.action.fl),
        trueCond: "closeBall",
        falseCond: "farGoal",
    },
    closeBall: {
        condition: (mgr, state) => mgr.getVisible(state.action.goal),
        trueCond: "ballGoalVisible",
        falseCond: "ballGoalInvisible",
    },
    ballGoalVisible: {
        exec(mgr, state) {
            state.command = {
                n: "kick",
                v: `100 ${mgr.getAngle(state.action.goal)}`
            }
        },
        next: "sendCommand",
    },
    ballGoalInvisible: {
        exec(mgr, state) {
            state.command = {
                n: "kick",
                v: "10 45"
            }
        },
        next: "sendCommand",
    },
}
module.exports = DT
