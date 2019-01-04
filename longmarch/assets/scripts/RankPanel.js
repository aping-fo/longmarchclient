var GameManager = require("GameManager");

cc.Class({
    extends: cc.Component,

    properties: {

        toggleContainer: {
            type: cc.ToggleContainer,
            default: null
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        for(var i = 0; i < this.toggleContainer.toggleItems.length; i++){
            this.toggleContainer.toggleItems[i].node.on("toggle", this.onToggleClick, this);
        }
    },

    start () {
        this.onToggleClick(this.toggleContainer.toggleItems[0]);
        this.toggleContainer.toggleItems[0].check();

    },

    update (dt) {
    },
    
    onToggleClick(toggle){
        if(toggle.node.name == "friend_Toggle"){
            GameManager.getInstance().OpenFriendRank();
        }else if(toggle.node.name == "world_Toggle"){
            GameManager.getInstance().OpenGroupRank();
        }
    },

    onBackBtnClick(btn){
        cc.director.loadScene("main");
    }
});
