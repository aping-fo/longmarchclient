var WXTool = require("WXTool");
var GameManager = require("GameManager");
var gameEnum=require('GameEnum');
var PopupTipsNode = require("PopupTipsNode");
var httpReq=require('HttpReq');
var UIHelper=require('UIHelper')
var SignPanel= require("SignPanel");
var _this
cc.Class({
    extends: cc.Component,

    properties: {
        coin: {
            default: null,                                  
            type: cc.Label, 
            serializable: true,   
        },
        time: {
            default: null,                                  
            type: cc.Label, 
            serializable: true,   
        },
        lbl_nick: {
            default: null,                                  
            type: cc.Label, 
            serializable: true,   
        },
        lbl_rank: {
            default: null,                                  
            type: cc.Label, 
            serializable: true,   
        },
        shop: {
            default: null,                                  
            type: cc.Animation, 
            serializable: true,   
        },
        
        rankListContent: {
            default: null,
            type: cc.Node,
            serializable: true,  
        }

    },
    onGotoPk()
    {
        GameManager.getInstance().Chicken_CreateRoom(4,function(resp){
            GameManager.getInstance().chickenMode=1;
            var roomId=resp;
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
    onGotoMall()
    {
        // if(this.showingLimit != null)
        // {
        //     GameManager.getInstance().shopType=this.showingLimit.category;
        //     cc.director.loadScene("shop", function(){
            
        //     });
        // }
        // else
        // {
        //     PopupTipsNode.appearWithText('专场未开始')
        // }
        this.shop.node.active=true;
        this.shop.play();
      
    },
    onBack()
    {
        cc.director.loadScene("main", function(){
        
        });
    },
    onLoad () {
        _this=this;
        this.shop.node.active=false;
        httpReq.errorHandler['2054'+'_'+'1100']= function(){PopupTipsNode.appearWithText('专场未开始')};  
        httpReq.errorHandler['1005'+'_'+'1100']= function(){PopupTipsNode.appearWithText('专场未开始')};  
        httpReq.errorHandler['3003'+'_'+'1101']= function(){_this.lbl_rank.string="未进入排名"}; 
    },

    start () {
        if(GameManager.getInstance().currentChickenLimit != null)
        {
            this.showingLimit=GameManager.getInstance().currentChickenLimit
        }
        else if(GameManager.getInstance().lastChickenLimit != null)
        {
            this.showingLimit=GameManager.getInstance().lastChickenLimit
        }
        this.updateInfo();
        this.updateRankInfo();
    },

    updateInfo(){
        this.coin.string = GameManager.getInstance().myInfo.limitScore;
        if(GameManager.getInstance().currentChickenLimit != null)
        {
            var day=Math.floor(GameManager.getInstance().chickenLimitTimeLeave/1000/60/60/24);
            var hour=Math.floor((GameManager.getInstance().chickenLimitTimeLeave-day*1000*60*60*24)/1000/60/60);
            this.time.string=day+"天"+hour+"小时"
        }
        else
        {
            this.time.string="已结束"
        }
        this.lbl_nick.string= GameManager.getInstance().myInfo.wxName;     
        UIHelper.SetImageFromUrl(cc.find("player/frame/mask/icon", this.node).getComponent(cc.Sprite), GameManager.getInstance().myInfo.iconUrl, true);
    },
    
    updateRankInfo(){
        var _this = this;
        var from = 0;
        var to = 50;
        GameManager.getInstance().Chicken_GET_LIMIT_RANK(function(resp){
            _this.lbl_rank.string=resp;
        });
        GameManager.getInstance().Chicken_GET_LIMIT_RANK_LIST(from, to, function(resp){
            var datas = resp.rankVOList;
            for(var i = 0; i < datas.length; i++){
                datas[i].index = from + i;
                datas[i].openId = datas[i].id;
                datas[i].score = datas[i].score;
                datas[i].nickName = datas[i].nickName;
                datas[i].avatarUrl = datas[i].avatarUrl;
            }
            var rankItems = _this.rankListContent.children;

            for(var i = 0; i < rankItems.length; i++){
                rankItems[i].active = false;
            }

            for(var i = 0; i < datas.length; i++){
                var item = null;

                if(i >= rankItems.length){
                    item = cc.instantiate(rankItems[0]);
                    item.setParent(_this.rankListContent);
                }else{
                    item = rankItems[i];
                }

                item.active = true;
        
                var data = datas[i];
                var name = data.nickName;
                var avatarUrl = data.avatarUrl;
        
                if(name.length > 4){
                    name = name.substr(0, 4) + "……";
                }
        
                item.getChildByName("lb_name").getComponent(cc.Label).string = name;
                UIHelper.SetImageFromUrl(cc.find("avatar/img_avatar", item).getComponent(cc.Sprite), avatarUrl, true);
                
                if(data.index + 1 == 1){
                    item.getChildByName("first").active     = true;
                    item.getChildByName("second").active    = false;
                    item.getChildByName("third").active     = false;
                    item.getChildByName("lb_rank").active   = false;
                }else if(data.index + 1 == 2){
                    item.getChildByName("first").active     = false;
                    item.getChildByName("second").active    = true;
                    item.getChildByName("third").active     = false;
                    item.getChildByName("lb_rank").active   = false;
                }else if(data.index + 1 == 3){
                    item.getChildByName("first").active     = false;
                    item.getChildByName("second").active    = false;
                    item.getChildByName("third").active     = true;
                    item.getChildByName("lb_rank").active   = false;
                }else{
                    item.getChildByName("first").active     = false;
                    item.getChildByName("second").active    = false;
                    item.getChildByName("third").active     = false;
                    item.getChildByName("lb_rank").active   = true;
                    if(data.index == -1){
                        item.getChildByName("lb_rank").getComponent(cc.Label).string = '无';
                    }else{
                        item.getChildByName("lb_rank").getComponent(cc.Label).string = data.index + 1 + '';
                    }
                }
                
                if(item.getChildByName("lb_num")){
                    item.getChildByName("lb_num").getComponent(cc.Label).string = data.score;
                }
            }
            _this.rankListContent.getParent().getParent().getComponent(cc.ScrollView).scrollToTop();
        });
    },

    OnSign(event)
    {
        if(GameManager.getInstance().currentChickenLimit != null)
        {
            SignPanel.show(80,function(result){   
                GameManager.getInstance().myInfo.limitScore=result;
                _this.coin.string = result;
                GameManager.getInstance().myInfo.isTodayLimitSigned=true;
            },!GameManager.getInstance().myInfo.isTodayLimitSigned,GameManager.getInstance().currentChickenLimit.category);
        }
      
    },

    closeShop()
    {
        this.shop.node.active=false;
    }

    // update (dt) {},
});
