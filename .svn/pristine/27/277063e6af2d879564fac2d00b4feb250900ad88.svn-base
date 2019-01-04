// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
var GameManager = require("GameManager");
var WXTool = require("WXTool");
var Map = require("Map");
var gameEnum = require('GameEnum');
var popUpWays = require('PopupWays')
var PopupTipsNode = require("PopupTipsNode");
var Alert = require("Alert")
var AudioManager = require("AudioManager");
var UserData = require("UserData");

const BUBBLE_TYPE_NORMAL = 1;   //步数兑换气泡
const BUBBLE_TYPE_GIVE = 2;     //别人给予气泡
const BUBBLE_TYPE_ASKFOR = 3;   //请求给予气泡
const BUBBLE_TYPE_ADVERTISE = 4;   //广告气泡
const BUBBLE_TYPE_GAME = 5;     //答题气泡

cc.Class({
    extends: cc.Component,

    properties: {
        canvas: cc.Node,
        bubbleContainer: cc.Node,

        lb_todayStep: cc.Label,
        lb_totalStep: cc.Label,
        lb_name: cc.Label,
        lb_rank: cc.Label,

        map: Map,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.bubbleNodes = [];
    },

    start() {
        // var lauchOption = GameManager.getInstance().lauchOption;//启动参数
        // this.CheckJoin(lauchOption);

        var _this = this;
        function checkLaunchOption(isOnlyInviteBattle) {
            var res = GameManager.getInstance().lauchOption;
            if (res != null && res.query != null) {
                var tips = '';
                
                if (res.query.roomId != null) {
                    tips = '是否接受邀请加入对战?';
                }else if(!isOnlyInviteBattle){
                    if (res.query.groupId != null) {
                        var invitorName = res.query.invitorName;
                        tips = '是否接受' + invitorName + '邀请加入组织?';
                    }
                    else if (res.query.openId != null) {
                        var invitorName = res.query.invitorName;
                        tips = '是否赠送' + invitorName + '步数';
                    }
                } 

                if (tips.length > 0) {
                    Alert.show(tips, function () {
                        if (res.query.roomId != null) {

                        }else if (res.query.groupId != null) {
                            var groupId = res.query.groupId;

                            var _this = this;
                            GameManager.getInstance().Group_AddMember(groupId, function (resp) {
                                _this.onGroupBtnClick();
                            });
                        }else if (res.query.openId != null) {
                            if (GameManager.getInstance().myInfo.todayStep <= 0) {
                                PopupTipsNode.appearWithText("可赠送步数不足");
                                return;
                            }

                            GameManager.getInstance().GiveRunData(res.query.openId, GameManager.getInstance().myInfo.todayStep, function (resp) {
                                _this.updateStepInfo();
                            });
                        }
                    }, true, "", 0.3);

                    GameManager.getInstance().lauchOption = null;
                }

            }
        }

        WXTool.getInstance().wxOnShow(function (res) {
            GameManager.getInstance().lauchOption = res;
            checkLaunchOption(true);
        });
        checkLaunchOption(false);

        //获取自己步数信息
        this.updateStepInfo();
        //获取自己组信息
        this.updateGroupInfo();

        //获取附近组织信息
        GameManager.getInstance().Group_GetInfoNearBy(function(resp){
            for(var i = 0; i < resp.length; i++){
                _this.map.updateOtherRolePositions(resp[i]);
            }
        });

        AudioManager.getInstance().playMusic(AudioManager.MUSIC_TYPE.NORMAL);
    },

    update(dt) {
    },

    updateStepInfo() {
        var _this = this;
        WXTool.getInstance().getRunData(function (encryptedData, iv) {
            GameManager.getInstance().GetRunData(encryptedData, iv, function (resp) {
                var step = resp;
                console.log("今天可捐献步数： " + step);
                _this.updateBubble(BUBBLE_TYPE_NORMAL, step);
            })
        });
        GameManager.getInstance().GetRoleInfo(function (resp) {
            _this.lb_totalStep.string = "当前累计步数：" + resp.totalStep;
            _this.lb_name.string = resp.nickName;
            _this.map.roleMove();
        });

        GameManager.getInstance().GetGiveRunData(function(resp){
            for(var i = 0; i < resp.length; i++){
                _this.updateBubble(BUBBLE_TYPE_GIVE, resp[i].step, resp[i]);
            }
        });

        this.updateBubble(BUBBLE_TYPE_ASKFOR);
        this.updateBubble(BUBBLE_TYPE_ADVERTISE);
        this.updateBubble(BUBBLE_TYPE_GAME);
    },

    updateGroupInfo(){
        var _this = this;

        GameManager.getInstance().Group_GetInfo(function (resp) {
            var rank = GameManager.getInstance().groupInfo.rank;
            var text = "世界排名：";
            if(rank > 0){
                text += rank;
            }else{
                text += "暂无";
            }
            _this.lb_rank.string = text;
        });
    },

    updateBubble(type, step, param){
        var bubbleNode = null;

        if(type == BUBBLE_TYPE_GIVE){
            //赠送存在多个
            var giveBubbles = this.bubbleNodes[type];
            if(giveBubbles == null){
                giveBubbles = [];
                this.bubbleNodes[type] = giveBubbles;
            }

            for(var i = 0; i < giveBubbles.length; i++){
                var giveBubble = giveBubbles[i];
                var userData = giveBubble.getComponent(UserData).getObject();
                if(userData.param.openId == param.openId){
                    bubbleNode = giveBubble;
                    break;
                }
            }
        }else{
            bubbleNode = this.bubbleNodes[type];
        }

        if(bubbleNode == null){
            bubbleNode = cc.instantiate(GameManager.getInstance().bubbleNode);
            bubbleNode.setParent(this.bubbleContainer);

            var width = 700, height = 700;
            var velocityX = 80, velocityY = 80;
            bubbleNode.position = new cc.Vec2(width / 2 - Math.random() * width, height / 2 - Math.random() * height);
            if(type == BUBBLE_TYPE_GIVE){
                this.bubbleNodes[type].push(bubbleNode);
            }else{
                this.bubbleNodes[type] = bubbleNode;
            }

            bubbleNode.getComponent(cc.RigidBody).linearVelocity = new cc.Vec2(Math.random() >0.5 ? velocityX : -velocityX, Math.random() >0.5 ? velocityY : -velocityY);
            bubbleNode.on("click", this.onBubbleClick, this);
        }

        bubbleNode.getComponent(UserData).setObject({type: type, step: step, param: param});

        switch(type){
            case BUBBLE_TYPE_NORMAL:
            {
                bubbleNode.getChildByName("lb_count").getComponent(cc.Label).string = step;
                bubbleNode.active = step > 0;
            }
                break;

            case BUBBLE_TYPE_GIVE:
            {
                bubbleNode.getChildByName("lb_count").getComponent(cc.Label).string = param.nickName + "赠送：" + step;
                bubbleNode.active = step > 0;
            }
                break; 

            case BUBBLE_TYPE_ASKFOR:
            {
                bubbleNode.getChildByName("lb_count").getComponent(cc.Label).string = "请求好友赠送步数";
            }
                break; 

            case BUBBLE_TYPE_ADVERTISE:
            {
                bubbleNode.getChildByName("lb_count").getComponent(cc.Label).string = "观看视频赠送步数";
            }
                break; 

            case BUBBLE_TYPE_GAME:
            {
                bubbleNode.getChildByName("lb_count").getComponent(cc.Label).string = "答题赢步数";
            }
                break; 
        }
    },

    onBubbleClick(btn){
        var userData = btn.node.getComponent(UserData);
        var bubbleType = userData.getObject().type;
        
        switch(bubbleType){
            case BUBBLE_TYPE_NORMAL:
            {
                if (GameManager.getInstance().myInfo.todayStep <= 0) {
                    PopupTipsNode.appearWithText("可兑换步数不足");
                    return;
                }
                var _this = this;
                GameManager.getInstance().TransferRunData(GameManager.getInstance().myInfo.todayStep, function (resp) {
                    _this.updateStepInfo();
                });
            }
                break;

            case BUBBLE_TYPE_GIVE:
            {
                var giveOpenId = userData.getObject().param.openId;
                var _this = this;
                GameManager.getInstance().TransferGiveRunData(giveOpenId, function (resp) {
                    _this.updateStepInfo();
                });
            }
                break;

            case BUBBLE_TYPE_ASKFOR:
            {
                WXTool.getInstance().shareToGiveStep(GameManager.getInstance().myInfo.openId, GameManager.getInstance().myInfo.wxName, function () {
                    PopupTipsNode.appearWithText("邀请成功");
                }, function () {
                    PopupTipsNode.appearWithText("邀请失败");
                });
            }
                break;
            
            case BUBBLE_TYPE_ADVERTISE:
            {
                PopupTipsNode.appearWithText("该功能未开放");
            }
                break;
            
            case BUBBLE_TYPE_GAME:
            {
                GameManager.getInstance().Chicken_StartMatch(function (resp) {
                    GameManager.getInstance().chickenMode = 3;
                    GameManager.getInstance().gameState = gameEnum.GAME_STATE.CHIKEN_MATCHING;
                    cc.director.loadScene("game", function () {
                    });
                });
            }
                break;
        }
    },

    onTransferStepBtnClick(event) {
        if (GameManager.getInstance().myInfo.todayStep <= 0) {
            PopupTipsNode.appearWithText("可兑换步数不足");
            return;
        }
        var _this = this;
        GameManager.getInstance().TransferRunData(GameManager.getInstance().myInfo.todayStep, function (resp) {
            _this.updateStepInfo();
        });
    },

    onGroupBtnClick(event) {
        GameManager.getInstance().LoadScene("group");
    },

    onClickShop() {
        cc.director.loadScene("shop", function () {
        });
    },

    onClickQuest() {
        GameManager.getInstance().Chicken_StartMatch(function (resp) {
            GameManager.getInstance().chickenMode = 3;
            GameManager.getInstance().gameState = gameEnum.GAME_STATE.CHIKEN_MATCHING;
            cc.director.loadScene("game", function () {

            });
        })
    },

    onClickRank(){
        cc.director.loadScene("rank");
    },

    onClickGroup() {
        GameManager.getInstance().LoadScene("group");
    },

    onShowPopUp() {
        popUpWays.show();
    },
});
