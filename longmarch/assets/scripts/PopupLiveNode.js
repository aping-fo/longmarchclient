var PopupWindow = require("PopupWindow");
var PopupTipsNode = require("PopupTipsNode");
var GameManager = require("GameManager");
var WXTool = require("WXTool");

cc.Class({
    extends: PopupWindow,

    statics: {
        show: function(){
            var node = cc.find("Canvas/PopupLiveNode");
            if(node == null){
                node = cc.instantiate(GameManager.getInstance().popupLiveNode);
                node.setParent(cc.Canvas.instance.node);
                node.position = cc.Vec2.ZERO;
            }
            
            node.active = true;
        }
    },

    properties: {
        watchVideoBtn: {
            type: cc.Button,
            default: null
        }
    },

    onLoad () {
        this.m_animation = this.getComponent(cc.Animation);
    },

    start () {
    },

    onEnable(){
        this.node.pauseSystemEvents(true);
        this.m_animation.play("popup_livenode_show");
        this.watchVideoBtn.interactable = WXTool.getInstance().advertiseVideoReady;
    },

    onWatchVideoBtnClick(btn){
        WXTool.getInstance().showAdvertiseVideo(function(){
            _this.onCloseBtnClick();
        }, function(){
            PopupTipsNode.ShowWithText("视频播放失败");
        });
    },

    onCloseBtnClick(btn){
        this.node.pauseSystemEvents(true);
        this.m_animation.play("popup_livenode_hide");
    },

    onFadeInFinish(){
        this.node.resumeSystemEvents(true);
    },

    onFadeOutFinish(){
        this.node.resumeSystemEvents(true);
        this.node.active = false;
    }
});
