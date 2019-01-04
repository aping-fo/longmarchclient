var GameManager = require("GameManager");
var httpReq=require('HttpReq');
var Alert = require("Alert");
var item=require("MallItem");
var PopupContact=require("PopupContact")
var CMD = require("CMD");
var cfgList;
var PopupTipsNode = require("PopupTipsNode");
var _this;
var touchStartX;
var isMoving
var popUpWays=require('PopupWays')
var WXTool = require("WXTool");
cc.Class({
    extends: cc.Component,

    properties: {
        itemCurent: {
            default: null,                                  
            type: item, 
            serializable: true,   
        },
        btn_accept: {
            default: null,                                  
            type: cc.Button, 
            serializable: true,   
        },
        btn_disaccept: {
            default: null,                                  
            type: cc.Button, 
            serializable: true,   
        },
        imgList:
        {
            default: null,
            type: Object,
        },
       
        
    },
    onLoad () {
        _this=this;
        this.itemNxt=cc.instantiate(this.itemCurent.node).getComponent(item);
        this.itemNxt.node.parent=this.itemCurent.node.parent;
        this.itemNxt.node.setPosition(new cc.v2(639,0));
        this.itemThird=cc.instantiate(this.itemCurent.node).getComponent(item);
        this.itemThird.node.parent=this.itemCurent.node.parent;
        this.itemThird.node.setPosition(new cc.v2(-639,0));
        this.itemThird.clear();
        this.itemNxt.clear();
        httpReq.errorHandler[CMD.BUY+'_'+'900']= function(){PopupTipsNode.appearWithText('可兑换步数不足')};
        httpReq.errorHandler[CMD.BUY+'_'+'901']= function(){PopupTipsNode.appearWithText('您已报名')};
        httpReq.errorHandler[CMD.CONSUME_MALL_ITEMS+'_'+'902']= function(){PopupTipsNode.appearWithText('您不是中奖者')};
        httpReq.errorHandler[CMD.CONSUME_MALL_ITEMS+'_'+'903']= function(){PopupTipsNode.appearWithText('重复填写')};
        this.itemCurent.node.on(cc.Node.EventType.TOUCH_MOVE, function(e){
           
            var move_x = e.touch._point.x - e.touch._prevPoint.x;
            if(move_x>50)
            {
                _this.onMoveRight();
            }
            if(move_x<-50)
            {
                _this.onMoveLeft();
            }

        })
    },
    start(){
        this.btn_accept.node.active=false;
        this.btn_disaccept.node.active=false;
        GameManager.getInstance().GetMallItems(function(resp){
            cfgList=resp.mallItems;
           
            // _this.icon.spriteFrame = spriteFrame;
            var loaded=0;
            _this.imgList={};
            for(var i=0;i<cfgList.length;i++)
            {
                cc.loader.loadRes("texture/mall/"+cfgList[i].icon, cc.SpriteFrame, function (err, spriteFrame) {
                    if(err == null)
                    {
                        _this.imgList[spriteFrame.name]=spriteFrame;
                        loaded++;
                        if(loaded == cfgList.length)
                        {
                            _this.itemCurent.setStaticInfo(cfgList[0],0,_this.imgList[cfgList[0].icon]);
                            _this.updateCount();
                            _this.onGetReward();
                        }
                    }
                   
                    });
            }
        })
    },
    onMoveRight(){
        if(isMoving)
        {
            return;
        }
        isMoving=true;
        var idx=this.itemCurent.idx;
        var toIdx=idx-1;
        if(toIdx<0)
        {
            toIdx=cfgList.length-1;
        }
        this.itemCurent.setStaticInfo(cfgList[toIdx],toIdx,_this.imgList[cfgList[toIdx].icon]);
        this.itemNxt.setStaticInfo(cfgList[idx],idx,_this.imgList[cfgList[idx].icon]);

        this.updateCount();

        var curPos=new cc.v2(-639,0)
        var nxtPos=new cc.v2(639,0)
        this.itemNxt.node.setPosition(new cc.v2(0,0));
        this.itemCurent.node.setPosition(curPos);

        this.itemThird.node.setPosition(new cc.v2(-639*2,0));

        var actionFadeOut  = cc.sequence(cc.moveTo(.2,nxtPos), cc.callFunc(function(){isMoving=false}));
        var actionFadeIn  = cc.sequence(cc.moveTo(.2,new cc.v2(0,0)), null);
        var actionFadeIn2  = cc.sequence(cc.moveTo(.2,new cc.v2(-639,0)), null);
        this.itemCurent.node.runAction(actionFadeIn);
        this.itemNxt.node.runAction(actionFadeOut);
        this.itemThird.node.runAction(actionFadeIn2);
        this.itemThird.clear();
        _this.onGetReward();
    },

    onMoveLeft(){
        if(isMoving)
        {
            return;
        }
        isMoving=true;
        var idx=this.itemCurent.idx;
        var toIdx=idx+1;
        if(toIdx>=cfgList.length)
        {
            toIdx=0;6
        }
        this.itemCurent.setStaticInfo(cfgList[toIdx],toIdx,_this.imgList[cfgList[toIdx].icon]);
        this.itemNxt.setStaticInfo(cfgList[idx],idx,_this.imgList[cfgList[idx].icon]);

        this.updateCount();

        var curPos=new cc.v2(639,0)
        var nxtPos=new cc.v2(-639,0)
        this.itemNxt.node.setPosition(new cc.v2(0,0));
        this.itemCurent.node.setPosition(curPos);

        this.itemThird.node.setPosition(new cc.v2(639*2,0));

        var actionFadeOut  = cc.sequence(cc.moveTo(.2,nxtPos), cc.callFunc(function(){isMoving=false}));
        var actionFadeIn  = cc.sequence(cc.moveTo(.2,new cc.v2(0,0)), null);
        var actionFadeIn2  = cc.sequence(cc.moveTo(.2,new cc.v2(639,0)), null);
        this.itemCurent.node.runAction(actionFadeIn);
        this.itemNxt.node.runAction(actionFadeOut);
        this.itemThird.node.runAction(actionFadeIn2);
        this.itemThird.clear();
        _this.onGetReward();
    },
    updateCount()
    {
        var id=this.itemCurent.cfg.id;
        GameManager.getInstance().GetParticipantCount(id,function(resp)
        {
            if(resp["id"] == id)
            {
                _this.itemCurent.setCurrentParticipantCount(resp["count"])
            }
            
        })

    },
    onAccept()
    {
        GameManager.getInstance().Buy(this.itemCurent.cfg.id,function(resp){
            PopupTipsNode.appearWithText('报名成功')
            var count=resp.count;
            var myStep=resp.step;
            GameManager.getInstance().myInfo.step=myStep;
            _this.itemCurent.updateMyStep();
            _this.itemCurent.setCurrentParticipantCount(count)

        })
    },
    onAdd()
    {
        popUpWays.show();
    },
    onDiffuse()
    {
        this.onMoveRight();
    },
    onBackToMain()
    {
        cc.director.loadScene("main", function(){
        });
    },
    onShare()
    {
        WXTool.getInstance().share();
    },
    onGetReward()
    {
        
        // this.btn_accept.node.active=false;
        // this.btn_disaccept.node.active=false;
        GameManager.getInstance().GetRewarder(function(resp)
        {
            var info=resp[_this.itemCurent.cfg.id];
            _this.btn_accept.node.active=true;
            _this.btn_disaccept.node.active=true;
            _this.btn_accept.interactable=(info == null || info.openid == null);
            _this.btn_disaccept.interactable=(info == null) || info.openid == null;
            _this.itemCurent.apartSign.active=info!= null && info.partaked;
            if(info != null && info.openid == GameManager.getInstance().myInfo.openId)
            {
                if(info.consumed)
                {
                    // PopupTipsNode.appearWithText('已经填写资料')
                }
                else
                {
                    Alert.show("恭喜您中奖了",function(){
                        PopupContact.show(function(name,phone,address){
                            GameManager.getInstance().ConsumeMallItems(name,phone,address,_this.itemCurent.cfg.id,function()
                            {
                                PopupTipsNode.appearWithText('填写成功')
                            })
                        },0.3);
                    },false,"")
                 
                }
               
            }
            else
            {
                // PopupTipsNode.appearWithText('您未中奖')
            }
        })
       
    },


});
