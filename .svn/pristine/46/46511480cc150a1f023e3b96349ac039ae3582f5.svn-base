var UIHelper = require("UIHelper");

cc.Class({
    extends: cc.Component,

    properties: {

    },

    start () {

    },

    onEnable(){
        //在canvas的最后一层
        UIHelper.SetLastSiblingIndex(this.node, cc.Canvas.instance.node);
    },

    onAnimationEnd(){
        this.node.active = false;
    }
});
