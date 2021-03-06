/**
 * DEPRECATED
 * */

const TA = {
    current: "start", // Текущее состояние автомата
    state: { // Описание состояния
        variables: {
            dist: Infinity,
            isMiniKick: false
        }, // Переменные
        timers: {
            t: 0
        }, // Таймеры
        next: true, // Нужен переход на следующее состояние
        synch: undefined, // Текущее действие
        local: {
            goalie: true,
            catch: 0
        }, // Внутренние переменные для методов
    },
    nodes: {
        /* Узлы автомата, в каждом узле: имя и узлы, на которые есть переходы */
        start: {
            n: "start",
            e: ["close", "near", "far"]
        },
        close: {
            n: "close",
            e: ["catch"]
        },
        catch: {
            n: "catch",
            e: ["kick"]
        },
        kick: {
            n: "kick",
            e: ["kick", "start"]
        },
        far: {
            n: "far",
            e: ["start"]
        },
        near: {
            n: "near",
            e: ["intercept", "start"]
        },
        intercept: {
            n: "intercept",
            e: ["start"]
        },
    },
    edges: {
        /* Рёбра автомата (имя каждого ребра указывает на
         узел-источник и узел-приёмник) */
        start_close: [{
            guard: [{
                s: "lt",
                l: {
                    v: "dist"
                },
                r: 2
            }]
        }],
        /* Список guard описывает перечень условий, проверяемых
         * для перехода по ребру. Знак lt - меньше, lte - меньше
         * либо равно. В качестве параметров принимаются числа или
         * значения переменных "v" или таймеров "t" */
        start_near: [{
            guard: [
                {
                    s: "lt",
                    l: {
                        v: "dist"
                    },
                    r: 15
                },
                {
                    s: "lte",
                    l: 2,
                    r: {
                        v: "dist"
                    }
                }
            ]
        }],
        start_far: [{
            guard: [{
                s: "lte",
                l: 15,
                r: {
                    v: "dist"
                }
            }]
        }],
        close_catch: [{
            synch: "catch!"
        }],
        /* Событие синхронизации synch вызывает на выполнение
         * соответствующую функцию */
        catch_kick: [{
            synch: "kick!"
        }],
        kick_kick: [{
            guard: [
                {
                    s: "lt",
                    l: {
                        v: "dist"
                    },
                    r: 2
                },
                {
                    s: "eq",
                    l: {
                        v: "isMiniKick"
                    },
                    r: true
                }
            ],
        }],
        kick_start: [{
            synch: "goBack!",
            assign: [{
                n: "t",
                v: 0,
                type: "timer"
            }]
        }],
        /* Список assign перечисляет присваивания для переменных
         * "variable" и таймеров "timer" */
        far_start: [{
            guard: [{
                s: "lt",
                l: 10,
                r: {
                    t: "t"
                }
            }],
            synch: "lookAround!",
            assign: [{
                n: "t",
                v: 0,
                type: "timer"
            }]
        },
            {
                guard: [{
                    s: "lte",
                    l: {
                        t: "t"
                    },
                    r: 10
                }],
                synch: "ok!"
            }
        ],
        near_start: [{
            synch: "ok!",
            assign: [{
                n: "t",
                v: 0,
                type: "timer"
            }]
        }],
        near_intercept: [{
            synch: "canIntercept?"
        }],
        /* Событие синхронизации synch может вызывать
         * соответствующую функцию для проверки возможности перехода
         * по ребру (заканчивается на знак "?") */
        intercept_start: [
            {
                synch: "runToBall!",
                assign: [{
                    n: "t",
                    v: 0,
                    type: "timer"
                }]
            },
        ]
    },
    actions: {
        beforeAction(taken, state) {
            // Действие перед каждым вычислением
            state.variables.dist = Infinity
            if (taken.ball) {
                // предыдущее положение мяча
                taken.ballPrev = taken.ball
                state.variables.dist = taken.ball.dist
            }
        },
        catch (taken, state) { // Ловим мяч
            if (taken.ball) {
                let angle = taken.ball.angle
                let dist = taken.ball.dist
                state.next = false
                if (dist > 0.5) {
                    if (state.local.goalie && dist < 0.8) {
                        if (state.local.catch < 1) {
                            state.local.catch++
                            return {
                                n: "catch",
                                v: angle
                            }
                        } else state.local.catch = 0
                    }
                    if (Math.abs(angle) > 15) return {
                        n: "turn",
                        v: angle
                    }
                    return {
                        n: "dash",
                        v: 30
                    }
                }
                state.next = true
            } else {
                state.next = true
                return {
                    n: "turn",
                    v: taken.ballPrev.angle
                }
            }
        },
        kick(taken, state) { // Пинаем мяч
            state.next = true
            if (taken.ball) {
                let dist = taken.ball.dist
                let angle = taken.ball.angle
                if (dist <= 0.5) {
                    let goal = taken.goal
                    let player = taken.teamOwn ? taken.teamOwn[0] : null
                    let target
                    if (goal && player) {
                        target = goal.dist < player.dist ? goal : player
                    } else if (goal) {
                        target = goal
                    } else if (player) {
                        target = player
                    }
                    if (target) {
                        state.variables.isMiniKick = false
                        return {
                            n: "kick",
                            v: `${target.dist*3+40} ${target.angle}`
                        }
                    }
                    state.next = false
                    state.variables.isMiniKick = true
                    let kickAngle = taken.botFlagsCount > taken.topFlagsCount ? 45 : -45
                    return {
                        n: "kick",
                        v: `10 ${kickAngle}`
                    }
                } else {
                    if (Math.abs(angle) > 10)
                        return {
                            n: "turn",
                            v: angle
                        }
                    return {
                        n: "dash",
                        v: dist * 5 + 60
                    }
                }
            } else if (state.variables.isMiniKick) {
                if (taken.ballPrev) {
                    return {
                        n: "turn",
                        v: taken.ballPrev.angle
                    }
                }
            }
        },
        goBack(taken, state) { // Возврат к воротам
            state.next = false
            state.local.look = undefined
            let goalOwn = taken.goalOwn
            if (!goalOwn) return {
                n: "turn",
                v: 60
            }
            if (Math.abs(goalOwn.angle) > 10)
                return {
                    n: "turn",
                    v: goalOwn.angle
                }
            if (goalOwn.dist < 2) {
                state.next = true
                return {
                    n: "turn",
                    v: 180
                }
            }
            return {
                n: "dash",
                v: goalOwn.dist * 2 + 40
            }
        },
        lookAround(taken, state) { // Осматриваемся
            state.next = false
            state.synch = "lookAround!"

            if (!state.local.look) {
                if (!taken.lookAroundFlags.fprc) return { n: "turn", v: 90 }
                state.local.look = "left"
                return { n: "turn", v: taken.lookAroundFlags.fprc.angle }
            }

            switch (state.local.look) {
                case "left":
                    if (!taken.lookAroundFlags.fprc) return { n: "turn", v: 90 }
                    if (Math.abs(taken.lookAroundFlags.fprc.angle > 8)) return { n: "turn", v: taken.lookAroundFlags.fprc.angle }
                    state.local.look = "center"
                    return {
                        n: "turn", v: -90
                    }
                case "center":
                    state.local.look = "right"
                    return {
                        n: "turn", v: 90
                    }

                case "right":
                    state.local.look = "back"
                    return {
                        n: "turn", v: 90
                    }
                case "back":
                    state.local.look = "left"
                    state.next = true
                    state.synch = undefined
                    return {
                        n: "turn", v: -90
                    }
                default:
                    state.next = true
            }
        },
        canIntercept(taken, state) { // Можем добежать первыми
            let ball = taken.ball
            let ballPrev = taken.ballPrev
            state.next = true
            if (!ball) return false
            if (taken.teamEnemy) {
                const enemy = taken.teamEnemy.find(enemy => {
                    let degrees = Math.sign(enemy.angle) === Math.sign(ball.angle)
                        ? Math.max(Math.abs(enemy.angle), Math.abs(ball.angle)) - Math.min(Math.abs(enemy.angle), Math.abs(ball.angle))
                        : Math.abs(enemy.angle) + Math.abs(ball.angle)
                    const enemyDistanceToBall = Math.sqrt(enemy.dist ** 2 + ball.dist ** 2 - 2 * enemy.dist * ball.dist * Math.cos(degrees * Math.PI / 180))

                    return enemyDistanceToBall < ball.dist
                })
                return !Boolean(enemy)
            }
            if (!ballPrev) return true
            return ball.dist <= ballPrev.dist + 0.5;

        },
        runToBall(taken, state) { // Бежим к мячу
            state.next = false
            let ball = taken.ball
            if (!ball) {
                return {
                    n: "turn",
                    v: 90
                }
            }
            if (ball.dist >= 15) return this.goBack(taken, state)
            if (ball.dist < 2) {
                state.next = true
                return {
                    n: "turn",
                    v: ball.angle
                }
            }
            if (Math.abs(ball.angle) > 10)
                return {
                    n: "turn",
                    v: ball.angle
                }
            return {
                n: "dash",
                v: ball.dist * 5 + 75
            }

        },
        ok(taken, state) { // Ничего делать не надо
            state.next = true;
            if (taken.ball) {
                return { n: "turn", v: taken.ball.angle }
            }
            return {
                n: "turn",
                v: 0
            }
        },
        empty(taken, state) {
            state.next = true
        } // Пустое действие
    }
}

// module.exports = TA