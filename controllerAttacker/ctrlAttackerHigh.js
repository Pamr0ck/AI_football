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
    //
    immediateReaction(input) { // Немедленная реакция
        const closeEnemy = input.closest(false)
        const closeMy = input.closest(true)
        if(input.canKick) {
            this.last = "kick"
            if (input.id < 8) {

                if (closeMy[0] && input.id > 3) {
                    input.newAction = "return"
                    if ((!input.goalOther || closeMy[0].dist < input.goalOther.dist - 15)
                        && closeMy[0].dist<40 &&closeMy[0].angle > 4  && closeMy[0].id !== 11)
                        return {n: "kick", v: `${closeMy[0].angle} ${closeMy[0].dist*2}`}
                }
                if (input.id > 3 && (closeMy[0] && closeMy[0].dist<30) ){

                    console.log('пасую, полузащ', input.id,'->',closeMy[0].id );
                    const angle = (closeMy[0].angle)
                    return {n: "kick", v: `${closeMy[0].dist*2+30} ${angle}`}
                }

                // по воротам
                if (input.goalOther) {
                    if (input.goalOther.dist > 35 &&  (closeEnemy[0] && closeEnemy[0].dist<1) && (closeMy[0] && closeMy[0].dist<30) && (!input.goalOwn || input.goalOwn.dist > 25)){
                        console.log('пасую пресуют', input.id,'->',closeMy[0].id );
                        const angle = (closeMy[0].angle)
                        return {n: "kick", v: `${closeMy[0].dist*2+30} ${angle}`}
                    }
                    return {n: "kick", v: `100 ${input.goalOther.angle}`}
                }
            } else {
                //пас от защитников своим либо выпинывание
                input.newAction = "return"
                let player = undefined;
                if (closeMy[0] && closeMy[0].id !== 11){
                    player = closeMy[0]
                } else if(closeMy[1] && closeMy[1].id!==11){
                    player = closeMy[1]
                }
                if(player){
                    console.log('пасую защ', input.id,'->',player.id );
                    const angle = (player.angle)
                    return {n: "kick", v: `${player.dist*2+30} ${angle}`}
                } else{
                    console.log('выпинываю ', input.id );
                    const topFlag = (input.side === 'l') ? 'frt' : 'flt'
                    const botFlag = (input.side === 'l') ? 'frb' : 'flb'
                    if (input.goalOther) return {n: "kick", v: `80 ${input.goalOther.angle}`}
                    else if (input.flags[topFlag]) return {n: "kick", v: `80 ${input.flags[topFlag].angle}`}
                    else if (input.flags[botFlag]) return {n: "kick", v: `80 ${input.flags[botFlag].angle}`}
                }
            }
            return {n: "kick", v: `10 45`}
        }
    },
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
