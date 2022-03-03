const orientation = require("../../orientation/orientation");

module.exports = {
    FOV: "80",
    FOVEdge: 60,
    seen: {},
    ball: {},
    action: {},
    side: '',
    ourCoords: '',

    areWeInLongitudeBounds: function(){
        this.ourCoords = orientation.orientationWithThreeFlag(...this.seen);
        let longDist = this.ourCoords.x - orientation.Flags[`g${this.side}`].x;
        if( Math.abs(longDist) > 2 )
            this.action = {n: "dash", v: `20 180`}; //turn to ball
        else
            this.isBallOnSide();
    },

    isBallOnSide: function()
    {
        if( this.ball.p[1] > 0 && this.ourCoords.y < orientation.Flags[`fg${this.side}t`].y || //on left of us
            this.ball.p[1] < 0 && this.ourCoords.y > orientation.Flags[`fg${this.side}b`].y) //on right of us

            this.action = {n: "dash", v: `${20} ${Math.sign(this.ball.p[1]) * 90}`}; //turn to ball
        else
            this.action = {n: "turn", v: this.ball.p[1]}; //turn to ball

    },

    isBallOnTheEdgeOfFOV: function()
    {
        if( Math.abs(this.ball.p[1]) > this.FOVEdge )
            this.action = {n: "turn", v: this.ball.p[1]};
        else
            this.areWeInLongitudeBounds();
    },

    getAction: function(parsed, side, ball)
    {
        this.side = side;
        this.seen = parsed;
        this.ball = ball;

        this.isBallOnTheEdgeOfFOV();

        console.log("Track ball", this.action);

        return this.action;
    }

};