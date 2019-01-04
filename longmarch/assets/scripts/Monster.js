var AudioManager = require("AudioManager");

var t=0;
var side=1;
cc.Class({
    extends: cc.Component,
    properties: {
},
    onLoad:function(){
        this.ani=this.node.getComponent(cc.Animation);
        this.node.active=false;
    },
    start(){
        // this.randomMove();
    },
    update(dt)
    {

    },
    randomMove(){

    },
    moveSideToFire(side)
    {
        this.node.active=true;
        this.node.setPosition(new cc.v2(side == 1?197:-197,-678));
        this.ani.play();
    },

})

