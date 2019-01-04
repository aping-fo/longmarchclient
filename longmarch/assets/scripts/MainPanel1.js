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
var AudioManager = require("AudioManager");
var UIHelper = require("UIHelper");
var gameEnum=require('GameEnum');
var WXTool = require("WXTool");
var PopupTipsNode = require("PopupTipsNode");
var PopupLiveNode = require("PopupLiveNode");
var SignPanel= require("SignPanel");
var httpReq=require('HttpReq');
var LampText = require("LampText");

var randomTips=['使用免死金牌可在答题对战中获得一次豁免权，单次对战最多只能使用一次。','积分可兑换商城商品'];

var _this;
var TestRoomId = 100;

const RoleDragonBoneAnims = ["walking", "smile", "hello"];

cc.Class({
    extends: cc.Component,

    properties: {
        infoNode: {
            type: cc.Node,
            default: null
        },

        familyCreateNode: {
            type: cc.Node,
            default: null
        },

        familyJoinNode: {
            type: cc.Node,
            default: null
        },

        roleDragonBone: {
            type: dragonBones.ArmatureDisplay,
            default: null
        },
        lampText: {
            type: LampText,
            default: null
        },

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        _this=this;
        httpReq.errorHandler['1005'+'_'+'1000']= function(){PopupTipsNode.appearWithText('今天已领取')};
       
        // WXTool.getInstance().wxOnShow(function(res){
        //     var lauchOption= res;
        //     _this.CheckJoin(lauchOption);
        //     _this.CheckJoinFamily(lauchOption);
        // });

        cc.director.on("PlayAdvertiseVideoDone", this.onPlayAdvertiseVideoDone, this);
        cc.find('Canvas/leftBar/sound_Btn/icon').getComponent(cc.Sprite).setState(!AudioManager.getInstance().isBgmOn()?cc.Sprite.State.GRAY:cc.Sprite.State.NORMAL);
    },

    start () {
        this.playLampText();
        this.joinFamilyId = 0;
        this.familyCreateNode.active = false;
        this.familyJoinNode.active = false;

        this.updateMyInfo();

        var lauchOption=GameManager.getInstance().lauchOption;//启动参数
        this.CheckJoin(lauchOption);
        this.CheckJoinFamily(lauchOption);
        GameManager.getInstance().lauchOption = null;

        GameManager.getInstance().GetRoleInfo(function(resp){
            _this.updateMyInfo(resp);
        });

        GameManager.getInstance().Group_GetInfo(function(resp){

        });
        AudioManager.getInstance().playMusic(AudioManager.MUSIC_TYPE.FIGHT);

        cc.director.getScheduler().schedule(function(){
            var name = RoleDragonBoneAnims[Math.floor(Math.random() * RoleDragonBoneAnims.length)];
            this.roleDragonBone.playAnimation(name);
        }, this, 10, false);

        GameManager.getInstance().Chicken_GET_LIMIT(function(resp)
        {
            GameManager.getInstance().currentChickenLimit=resp.current;
            GameManager.getInstance().nextChickenLimit=resp.next;
            GameManager.getInstance().lastChickenLimit=resp.last;
        })
    },

    updateMyInfo(resp){
        this.infoNode.getChildByName("lb_name").getComponent(cc.Label).string = GameManager.getInstance().myInfo.wxName;      
        UIHelper.SetImageFromUrl(cc.find("avatar/img_avatar", this.infoNode).getComponent(cc.Sprite), GameManager.getInstance().myInfo.iconUrl, true);

        if(resp != null){
            GameManager.getInstance().myInfo.step=resp["step"];
            this.infoNode.getChildByName("lb_level").getComponent(cc.Label).string = "LV." + resp["level"];
            this.infoNode.getChildByName("lb_num").getComponent(cc.Label).string = resp["step"];
            if(resp["levelUpExp"] == 0){
                this.infoNode.getChildByName("expProgress").getComponent(cc.ProgressBar).progress = 1;
            }else{
                this.infoNode.getChildByName("expProgress").getComponent(cc.ProgressBar).progress = resp["exp"] / resp["levelUpExp"];
            }
            
            var isTodaySigned=resp['isTodaySigned'];
            GameManager.getInstance().myInfo.isTodaySigned=isTodaySigned;
            var isTodayLimitSigned=resp['isTodayLimitSigned'];
            GameManager.getInstance().myInfo.isTodayLimitSigned=isTodayLimitSigned;
            if(!isTodaySigned)
            {
                this.OnSign(null);
            }
        }
    },

    onPvpBtnClick(btn){
        GameManager.getInstance().Chicken_CreateRoom(3,function(resp){
            GameManager.getInstance().chickenMode=1;
            GameManager.getInstance().isRoomOwner=true;
            var roomId=resp;
            GameManager.getInstance().roomId=roomId;
            WXTool.getInstance().shareToPlayTogether(GameManager.getInstance().myInfo.wxName, roomId,function(){
                GameManager.getInstance().gameState = gameEnum.GAME_STATE.CHIKEN_MATCHING;
                cc.director.loadScene("game", function(){
            
                });
            },function()
            {
                GameManager.getInstance().lauchOption=null;
                GameManager.getInstance().Chicken_ExitRoom(function (resp) {
                })
            });    
        })
    },

    onRankBtnClick(btn){
        GameManager.getInstance().LoadScene("rank");
    },

    onReviewBtnClick(btn){
        GameManager.getInstance().LoadScene("review");
    },

    onSoundBtnClick(btn){
        var btn=btn.target;
        var sp=cc.find('icon',btn).getComponent(cc.Sprite);
        sp.setState(AudioManager.getInstance().isBgmOn()?cc.Sprite.State.GRAY:cc.Sprite.State.NORMAL);
        
        AudioManager.getInstance().setBgmOn(!AudioManager.getInstance().isBgmOn());
    },

    onAddLiveBtnClick(btn){
        PopupLiveNode.show();
    },

    ////////////////////////////////  组织  ////////////////////////////////
    onFamilyInfoBtnClick(btn){
        if(GameManager.getInstance().groupInfo == null){
            return;
        }
        
        if(GameManager.getInstance().groupInfo.info == null){
            //创建组织
            this.familyCreateNode.active = true;
            this.familyCreateNode.getComponent(cc.Animation).play("main_createfamily", 0);
            this.familyCreateNode.getChildByName("createNode1").active = false;
        }else{
            cc.director.loadScene("group");
        }
    },

    onCloseCreateFamilyNodeBtnClick(btn){
        this.familyCreateNode.active = false;
    },

    onCreateFamilyBtnClick(btn){
        this.familyCreateNode.getChildByName("createNode1").active = true;
    },

    onCloseCreateFamilyNode1BtnClick(btn){
        this.familyCreateNode.getChildByName("createNode1").active = false;
    },

    onCreateFamilyOkBtnClick(btn){
        var name = cc.find("createNode1/panel/eb_name", this.familyCreateNode).getComponent(cc.EditBox).string;
        
        if(name.length == 0){
            PopupTipsNode.appearWithText("名字不能为空");
            return;
        }

        this.onCloseCreateFamilyNodeBtnClick();

        GameManager.getInstance().Group_Create(name, function(resp){
            cc.director.loadScene("group");
        });
    },

    ////////////////////////////////  邀请进组织  ////////////////////////////////
    onJoinFamilyBtnClick(btn){
        if(this.joinFamilyId == 0){
            return;
        }
        var _this = this;
        GameManager.getInstance().Group_AddMember(this.joinFamilyId,function(resp){
            _this.onFamilyInfoBtnClick();
        });
    },

    onCloseJoinFamliyBtnClick(btn){
        this.familyJoinNode.active = false;
    },

    onPracticeBtnClick(btn){
        GameManager.getInstance().Chicken_CreateRoom(2,function(resp){
            GameManager.getInstance().isRoomOwner=true;
            GameManager.getInstance().chickenMode=2;
            GameManager.getInstance().gameState = gameEnum.GAME_STATE.CHIKEN_MATCHING;
            cc.director.loadScene("game", function(){
        
            });
        })
    },

    onFriendPkClick(btn)
    {
        // GameManager.getInstance().Chicken_CreateRoom(4,function(resp){
        //     GameManager.getInstance().chickenMode=1;
        //     var roomId=resp;
        //     WXTool.getInstance().shareToPlayTogether(GameManager.getInstance().myInfo.wxName, roomId,function(){
        //         GameManager.getInstance().gameState = gameEnum.GAME_STATE.CHIKEN_MATCHING;
        //         cc.director.loadScene("game", function(){
            
        //         });
        //     },function()
        //     {
        //         GameManager.getInstance().lauchOption=null;
        //         GameManager.getInstance().Chicken_ExitRoom(function (resp) {
        //         })
        //     });    
        // })
        GameManager.getInstance().Chicken_GET_LIMIT(function(resp)
        {
            GameManager.getInstance().currentChickenLimit=resp.current;
            GameManager.getInstance().nextChickenLimit=resp.next;
            GameManager.getInstance().lastChickenLimit=resp.last;
            GameManager.getInstance().chickenLimitTimeLeave=resp.timeLeave;
            cc.director.loadScene("mainLimit", function(){
        
            });
        })
      
      
    },
    onShopClick(btn)
    {
        GameManager.getInstance().shopType=0;
        cc.director.loadScene("shop", function(){
        
        });
    },
    CheckJoin(lauchOption)//检查是否被邀请进入战斗
    {
        if(lauchOption == null || lauchOption.query == null)
        {
            
        }
        else{//卡片启动流程
            var roomId=lauchOption.query.roomId;
            console.log("roomId:"+roomId)
            if(roomId != null)
            {
                //加入房间
                GameManager.getInstance().Chicken_JoinRoom(roomId,function(resp){
                    GameManager.getInstance().isRoomOwner=false;
                    GameManager.getInstance().roomId=roomId;
                    GameManager.getInstance().chickenMode=1;
                    GameManager.getInstance().gameState = gameEnum.GAME_STATE.CHIKEN_MATCHING;
                    GameManager.getInstance().LoadScene("game");
                    
                });
                GameManager.getInstance().lauchOption=null;
            }
        }
    },
    
    CheckJoinFamily(lauchOption)//检查是否被邀请进入战斗
    {
        if(lauchOption == null || lauchOption.query == null){
            return;
        }
        
        //卡片启动流程
        // var familyId = "bb08a80f-9c1c-4a39-937d-a6babcf13282";
        // var invitorName = "fadsf";
        var familyId=lauchOption.query.familyId;
        var invitorName = lauchOption.query.invitorName;
        console.log("invite join family", familyId, invitorName);
        if(familyId != null)
        {
            //加入房间
            this.joinFamilyId = familyId;
            this.familyJoinNode.active = true;
            this.familyJoinNode.getComponent(cc.Animation).play("main_Invitefamily");
            cc.find("panel/lb_name", this.familyJoinNode).getComponent(cc.Label).string = invitorName;
            GameManager.getInstance().lauchOption=null;
        }
    },
    OnSign(event)
    {
        SignPanel.show(80,function(result){   
            GameManager.getInstance().myInfo.step=result;
            _this.infoNode.getChildByName("lb_num").getComponent(cc.Label).string = result;
            GameManager.getInstance().myInfo.isTodaySigned=true;
        },!GameManager.getInstance().myInfo.isTodaySigned,0);
    },
    
    onPlayAdvertiseVideoDone(result){
        if(result){
            GameManager.getInstance().GainTool(function(resp){
                _this.infoNode.getChildByName("lb_live_num").getComponent(cc.Label).string = resp;
            });
        }
    },
    playLampText()
    {

        var tips;
        if(GameManager.getInstance().brodcastList != null && GameManager.getInstance().brodcastList.length >0)
        {
            tips=GameManager.getInstance().brodcastList.pop()
            _this.doPlayLampText(tips)
        }
        else
        {
            GameManager.getInstance().getBrodcast(function(resp){
                GameManager.getInstance().brodcastList=resp;
                if(resp != null && resp.length >0)
                {
                    tips=GameManager.getInstance().brodcastList.pop()
                }
                _this.doPlayLampText(tips)
            })
        }
    
        
    },
    doPlayLampText(data)
    {
        var randomTime=10+5*Math.random();
        var random=Math.round(Math.random()*(randomTips.length-1))
        var tips=data == null?randomTips[random]:data
        this.scheduleOnce(function(){
            _this.lampText.play(tips,function(){_this.playLampText()});
        },randomTime)
    }
});
