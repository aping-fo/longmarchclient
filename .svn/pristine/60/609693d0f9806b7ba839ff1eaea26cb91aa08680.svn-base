var GameManager = require("GameManager");
var WXTool = require("WXTool");
var gameEnum = require('GameEnum');
var PopupTipsNode = require("PopupTipsNode");

var PopupWays = {
    _popUp: null,           // prefab
    _btn_friend: null,
    _btn_ad: null,
    _btn_quest: null,
    _btn_close: null,
    _animSpeed: 0.3,    // 动画速度
};

cc.Class({
    extends: cc.Component,

    properties: {


    },


    statics: {

        /**
         * detailString :   内容 string 类型.
         * enterCallBack:   确定点击事件回调  function 类型.
         * neeCancel:       是否展示取消按钮 bool 类型 default YES.
         * spritePath:      动态加载弹框中精灵图片的resources路径
         * duration:        动画速度 default = 0.3.
        */
        show() {
           
            var self = this;

            // 判断
            if (PopupWays._popUp != undefined) return;
            GameManager.getInstance().hasPopShowing=true;
            cc.loader.loadRes("prefabs/PopupWays", cc.Prefab, function (error, prefab) {

                if (error) {
                    cc.error(error);
                    return;
                }

                var popUp = cc.instantiate(prefab);
                PopupWays._popUp = popUp;

                // 动画 
                var cbFadeOut = cc.callFunc(self.onFadeOutFinish, self);
                var cbFadeIn = cc.callFunc(self.onFadeInFinish, self);
                self.actionFadeIn = cc.sequence(cc.fadeTo(PopupWays._animSpeed, 255), cbFadeIn);
                self.actionFadeOut = cc.sequence(cc.fadeTo(PopupWays._animSpeed, 0), cbFadeOut);


                PopupWays._btn_friend = cc.find("btn_friend", PopupWays._popUp).getComponent(cc.Button);
                PopupWays._btn_ad = cc.find("btn_video", PopupWays._popUp).getComponent(cc.Button);
                PopupWays._btn_quest = cc.find("btn_invite", PopupWays._popUp).getComponent(cc.Button);
                PopupWays._btn_close = cc.find("btn_close", PopupWays._popUp).getComponent(cc.Button);

                // 添加点击事件
                PopupWays._btn_friend.node.on('click', self.onButtonClicked, self);
                PopupWays._btn_ad.node.on('click', self.onButtonClicked, self);
                PopupWays._btn_quest.node.on('click', self.onButtonClicked, self);
                PopupWays._btn_close.node.on('click', self.onButtonClicked, self);

                // 父视图
                PopupWays._popUp.parent = cc.find("Canvas");

                // 展现 PopupWays
                self.startFadeIn();

                self.configPopupContact();

            });

            // 参数
            self.configPopupContact = function () {


            };

            // 执行弹进动画
            self.startFadeIn = function () {
                cc.eventManager.pauseTarget(PopupWays._popUp, true);
                PopupWays._popUp.position = cc.p(0, 0);
                PopupWays._popUp.setScale(1);
                PopupWays._popUp.opacity = 255;
                PopupWays._popUp.runAction(self.actionFadeIn);
            };

            // 执行弹出动画
            self.startFadeOut = function () {
                cc.eventManager.pauseTarget(PopupWays._popUp, true);
                if (PopupWays._popUp != null) {
                    PopupWays._popUp.runAction(self.actionFadeOut);
                }

            };

            // 弹进动画完成回调
            self.onFadeInFinish = function () {
                cc.eventManager.resumeTarget(PopupWays._popUp, true);
            };

            // 弹出动画完成回调
            self.onFadeOutFinish = function () {
                self.onDestory();
            };
            // 销毁 PopupWays 
            self.onDestory = function (isGoToGame) {
                PopupWays._popUp.destroy();
                PopupWays._enterCallBack = null;

                PopupWays._popUp = null;
                PopupWays._btn_friend = null;
                PopupWays._btn_ad = null;
                PopupWays._btn_quest = null;
                PopupWays._btn_close = null;
                PopupWays._animSpeed = 0.3;
                GameManager.getInstance().hasPopShowing=false;
                if (isGoToGame) {
                  
                };
            };

            self.shareToFriend = function () {
                WXTool.getInstance().shareToGiveStep(GameManager.getInstance().myInfo.openId, GameManager.getInstance().myInfo.wxName, function () {
                    PopupTipsNode.appearWithText("邀请成功");
                }, function () {
                    PopupTipsNode.appearWithText("邀请失败");
                });
            }

            // 按钮点击事件
            self.onButtonClicked = function (event) {
                var btn_name = event.target.name;
                switch (btn_name) {
                    case "btn_close":
                        self.startFadeOut();
                        break;

                    case "btn_friend":
                        self.shareToFriend();
                        break;

                    case "btn_video":
                        break;

                    case "btn_invite":
                    GameManager.getInstance().Chicken_StartMatch(function (resp) {
                        GameManager.getInstance().chickenMode = 3;
                        GameManager.getInstance().gameState = gameEnum.GAME_STATE.CHIKEN_MATCHING;
                        cc.director.loadScene("game", function () {
                            self.onDestory(true);
                        })
                    });
                        

                        break;

                }


            };


        }


    },

    start() {

    },


});