const ctrlAttackHigh = {
    execute(input) {
        const immediate = this.immediateReaction(input)
        if(immediate) return immediate
        const defend = this.defendGoal(input)
        if(defend) return defend
        if(this.last == "defend")
            input.newAction = "return"
        this.last = "previous"
    },
    immediateReaction(input) { // Немедленная реакция
        const closeEnemy = input.closest(false)
        const closeMy = input.closest(true)
        if ((closeEnemy[0] && closeEnemy[0].dist<1) && (closeMy[0] && closeMy[0].dist<20) ){
            // console.log('пресуют', input.id, input.canKick);
            if (input.canKick){
                console.log('пасую', input.id,closeMy[0] );
                const angle = (input.playersListMy[0].p[1])
                return {n: "kick", v: `${closeMy[0].dist*2+30} ${angle}`}
            }
        }
        if(input.canKick) {
            this.last = "kick"
            if (input.id < 8) {
                if (input.playersListMy.length && input.id > 3) {
                    input.newAction = "return"
                    input.playersListMy.sort((p1, p2) => {
                        return p1.p[1] - p2.p[1]
                    })
                    if ((!input.goalOther || input.playersListMy[0].p[1] < input.goalOther.dist - 15)
                        && input.playersListMy[0].p[1] > 4 && (!input.goalOwn || input.goalOwn.dist > 25))
                        return {n: "kick", v: `${input.playersListMy[0].p[1]*2} ${input.playersListMy[0].p[0]}`}
                }
                if (input.goalOther) {
                    if (input.goalOther.dist > 40)
                        return {n: "kick", v: `30 ${input.goalOther.angle}`}
                    return {n: "kick", v: `100 ${input.goalOther.angle}`}
                }
            } else {
                input.newAction = "return"
                const topFlag = (input.side === 'l') ? 'frt' : 'flt'
                const botFlag = (input.side === 'l') ? 'frb' : 'flb'
                if (input.goalOther) return {n: "kick", v: `80 ${input.goalOther.angle}`}
                else if (input.flags[topFlag]) return {n: "kick", v: `80 ${input.flags[topFlag].angle}`}
                else if (input.flags[botFlag]) return {n: "kick", v: `80 ${input.flags[botFlag].angle}`}
            }
            return {n: "kick", v: `10 45`}
        }
    },
    //|| (close[1] && close[1].dist > input.ball.dist)
    //                 || !close[1]
    defendGoal(input) { // Защита ворот
        if(input.ball) {
            const close = input.closest(true)
// если я ближ другого игрока, то я бегу к мячу
            if((close[0] && close[0].dist > input.ball.dist)
                || !close[0] ) {
                this.last = "defend"
                if (input.id < 4 && input.goalOwn && input.goalOwn.dist < 50) {
                    input.newAction = "return"
                } else if (input.id > 7 && input.goalOther && input.goalOther.dist < 50) {
                    input.newAction = "return"
                } else if (input.id > 3 && input.id < 8 && input.goalOwn && input.goalOwn.dist < 25){
                    input.newAction = "return"
                }
                else {
                    if (Math.abs(input.ball.angle) > 5)
                        return {n: "turn", v: input.ball.angle}
                    if (input.ball.dist > 1)
                        return {n: "dash", v: 110}
                    else
                        return {n: "dash", v: 30}
                }
            }
        }
    },
}
module.exports = ctrlAttackHigh
