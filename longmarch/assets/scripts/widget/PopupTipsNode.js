// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

var PopupWindow = require("PopupWindow");

var PopupTipsNode = cc.Class({
    extends: PopupWindow,

    properties: {
        contentLb: {
            type: cc.Label,
            default: null
        }
    },

    statics: {
        appearWithText: function(text){
            var node = cc.find("Canvas/PopupTipsNode");
            if(node != null){
                node.getComponent(PopupTipsNode)._appearWithText(text);
            }else{
                cc.loader.loadRes("prefabs/PopupTipsNode", function(err, prefab){
                    if(err){
                        console.error(err);
                        return;
                    }
                    node = cc.instantiate(prefab);
                    node.setParent(cc.Canvas.instance.node);
                    node.getComponent(PopupTipsNode)._appearWithText(text);
                    return;
                });
            }
        }
    },

    start () {

    },

    _appearWithText(text){
        this.node.active = true;
        this.contentLb.string = text;
        this.node.getComponent(cc.Animation).play();
    },

    onAnimationEnd(){
        this.node.active = false;
    }
});
