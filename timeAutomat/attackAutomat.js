const TA = {
    current: "start", // Текущее состояние автомата
    state: { // Описание состояния
        variables: {
            dist: undefined,
            angle: undefined
        }, // Переменные
        timers: {
            t: 0
        }, // Таймеры
        next: true, // Нужен переход на следующее состояние
        synch: undefined, // Текущее действие
        local: {
        }, // Внутренние переменные для методов
    },
    nodes: {
        /* Узлы автомата, в каждом узле: имя и узлы, на кото-
         рые есть переходы */
        start: {
            n: "start",
            e: ["action", "rotate",]
        },
        rotate: {
            n: "rotate",
            e: ["start"]
        },
        action: {
            n: "action",
            e: ["start", "goalCheck", "rotateToBall", "runToBall"]
        },
        rotateToBall: {
            n: "rotateToBall",
            e: ["action"]
        },
        runToBall: {
            n: "runToBall",
            e: ["action"]
        },
        goalCheck: {
            n: "goalCheck",
            e: ["start", "kickHard", "kickWeak"]
        },
        kickHard: {
            n: "kickHard",
            e: ["start"]
        },
        kickWeak: {
            n: "kickWeak",
            e: ["goalCheck"]
        },
    },
    edges: {
        /* Рёбра автомата (имя каждого ребра указывает на
         узел-источник и узел-приёмник) */
        start_rotate: [{}],
        rotate_start: [{}],
        /* Список guard описывает перечень условий, проверяемых
         * для перехода по ребру. Знак lt - меньше, lte - меньше
         * либо равно. В качестве параметров принимаются числа или
         * значения переменных "v" или таймеров "t" */
        start_action: [{
            synch: "isBallVisible?"
        }],
        action_start: [{
            synch: "isBallInvisible?"
        }],
        action_goalCheck: [{
            guard: [
                {
                    s: "lt",
                    l: {
                        v: "dist"
                    },
                    r: 0.5
                },
            ],
        }],
        action_rotateToBall: [{
            synch: "isBigAngle?"
        }],
        rotateToBall_action: [{}],
        action_runToBall: [{}],
        runToBall_action: [{}],
        goalCheck_start: [{
            synch: "isBallInvisible?"
        }],
        goalCheck_kickHard: [{
            synch: "isGoalVisible?"
        }],
        kickHard_start: [{}],
        goalCheck_kickWeak: [{}],
        kickWeak_goalCheck: [{}],
    },
    actions: {
        beforeAction(taken, state) {
            // Действие перед каждым вычислением
            state.variables.dist = undefined
            state.variables.angle = undefined
            if (taken.ball) {
                // предыдущее положение мяча
                taken.ballPrev = taken.ball
                state.variables.dist = taken.ball.dist
                state.variables.angle = taken.ball.angle
            }
        },
        rotate(taken, state) {
            state.next = true
            return {
                n: "turn",
                v: "90"
            }
        },
        isBallVisible(taken, state) {
            state.next = true
            return Boolean(taken.ball)
        },
        isBallInvisible(taken, state) {
            state.next = true
            return !Boolean(taken.ball)
        },
        isBigAngle(taken, state) {
            state.next = true
            return Math.abs(state.variables.angle) > 4
        },
        rotateToBall(taken, state) {
            state.next = true
            return {
                n: "turn",
                v: state.variables.angle
            }
        },
        runToBall(taken, state) {
            state.next = true
            return {
                n: "dash",
                v: 100
            }
        },
        isGoalVisible(taken, state) {
            state.next = true
            return Boolean(taken.goal)
        },
        kickHard(taken, state) {
            state.next = true
            return {
                n: "kick",
                v: `100 ${taken.goal.angle}`
            }
        },
        kickWeak(taken, state) {
            state.next = true
            if (Math.abs(state.variables.angle) > 10) {
                return {
                    n: "turn",
                    v: state.variables.angle
                }
            }
            if (state.variables.dist >= 0.5) {
                return {
                    n: "dash",
                    v: 40
                }
            }
            return {
                n: "kick",
                v: "10 45"
            }
        },
    }
}

module.exports = TA