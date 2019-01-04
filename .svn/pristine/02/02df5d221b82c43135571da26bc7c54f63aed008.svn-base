/**
 * 启动面板
 * 
 * 用户登录和授权面板
 */
var WXTool = require("WXTool")
var GameManager = require("GameManager");
var AudioManager = require("AudioManager");
var httpReq=require('HttpReq');
var TEST_OPEN_ID = "109";

cc.Class({
    extends: cc.Component,

    properties: {

        progressBar: {
            type: cc.ProgressBar,
            default: null
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.init();

        cc.director.on("WXLoginSuccess", this.onWXLoginSuccess, this);

        GameManager.getInstance().lauchOption= WXTool.getInstance().getLaunchOptionsSync();//启动参数
        console.log("lauchOption:", GameManager.getInstance().lauchOption);
    },

    start () {
        this.progressBar.node.active = false;
        WXTool.getInstance().login();
    },

    onDestroy(){
        cc.loader.onProgress = null;
    },

    init(){
        //按钮添加音效
        var buttonTouchEnd = cc.Button.prototype._onTouchEnded;
        cc.Button.prototype._onTouchEnded = function(t){
            buttonTouchEnd.call(this, t);
            if(this.interactable && this.enabledInHierarchy){
                AudioManager.getInstance().playEffect(AudioManager.EFFECT_TYPE.BUTTON);
            }
        }
    },

    // update (dt) {},
    onWXLoginSuccess(){
        console.log("wx login success")
        this.prepareResource();
    },

    prepareResource(){
    //     var resp="\"{\\\"stepInfoList\\\":[{\\\"timestamp\\\":1542384000,\\\"step\\\":5863},{\\\"timestamp\\\":1542470400,\\\"step\\\":2665},{\\\"timestamp\\\":1542556800,\\\"step\\\":4277},{\\\"timestamp\\\":1542643200,\\\"step\\\":4334},{\\\"timestamp\\\":1542729600,\\\"step\\\":5804},{\\\"timestamp\\\":1542816000,\\\"step\\\":4424},{\\\"timestamp\\\":1542902400,\\\"step\\\":3728},{\\\"timestamp\\\":1542988800,\\\"step\\\":3780},{\\\"timestamp\\\":1543075200,\\\"step\\\":217},{\\\"timestamp\\\":1543161600,\\\"step\\\":5224},{\\\"timestamp\\\":1543248000,\\\"step\\\":5491},{\\\"timestamp\\\":1543334400,\\\"step\\\":5884},{\\\"timestamp\\\":1543420800,\\\"step\\\":4347},{\\\"timestamp\\\":1543507200,\\\"step\\\":5757},{\\\"timestamp\\\":1543593600,\\\"step\\\":9629},{\\\"timestamp\\\":1543680000,\\\"step\\\":21572},{\\\"timestamp\\\":1543766400,\\\"step\\\":4750},{\\\"timestamp\\\":1543852800,\\\"step\\\":3205},{\\\"timestamp\\\":1543939200,\\\"step\\\":5557},{\\\"timestamp\\\":1544025600,\\\"step\\\":8967},{\\\"timestamp\\\":1544112000,\\\"step\\\":3096},{\\\"timestamp\\\":1544198400,\\\"step\\\":1109},{\\\"timestamp\\\":1544284800,\\\"step\\\":675},{\\\"timestamp\\\":1544371200,\\\"step\\\":3668},{\\\"timestamp\\\":1544457600,\\\"step\\\":5397},{\\\"timestamp\\\":1544544000,\\\"step\\\":6375},{\\\"timestamp\\\":1544630400,\\\"step\\\":6282},{\\\"timestamp\\\":1544716800,\\\"step\\\":8926},{\\\"timestamp\\\":1544803200,\\\"step\\\":15291},{\\\"timestamp\\\":1544889600,\\\"step\\\":9015},{\\\"timestamp\\\":1544976000,\\\"step\\\":1081}],\\\"watermark\\\":{\\\"timestamp\\\":1545027540,\\\"appid\\\":\\\"wx2b9c4e24426c97be\\\"}}\""
    //     var runData = JSON.parse(resp)
    //     console.info(runData);
    //   if (runData["\"stepInfoList\""])
    //   {
    //     runData.stepInfoList = runData.stepInfoList.reverse()
    //     for (var i in runData.stepInfoList)
    //     {
    //       runData.stepInfoList[i].date = util.formatTime(new Date(runData.stepInfoList[i].timestamp*1000))
    //     }
    //   }  
    //   return;
        this.progressBar.node.active = true;
        var code=WXTool.getInstance().getCode()
        if(!WXTool.enable)
        {          
            // httpReq.openId=parseInt(Math.random()*999);
            httpReq.openId = TEST_OPEN_ID;
        }
        GameManager.getInstance().GetOpenId(code,
            function(resp)
            {
                var openId=resp['openId'];
                WXTool.getInstance().setOpenId(openId);
                httpReq.openId=openId;
                GameManager.getInstance().myInfo = {
                    wxName: WXTool.getInstance().getWxName(),
                    iconUrl: WXTool.getInstance().getAvatarUrl(),
                    openId: openId,
                    todayStep: 0,
                    totalStep: 0,
                    step: 0,
                };

                if(resp['hasRole'])
                {
                    GameManager.getInstance().UpdateRole(GameManager.getInstance().myInfo['wxName'],GameManager.getInstance().myInfo['iconUrl'],function(resp){
                        if(resp.toString() == "ok")
                        {
                            // GameManager.getInstance().PreLoadScene("game");
                            GameManager.getInstance().LoadScene("main");
                        }
                    });
                }
                else
                {
                    GameManager.getInstance().CreateRole(GameManager.getInstance().myInfo['wxName'],GameManager.getInstance().myInfo['iconUrl'],function(resp){
                        if(resp.toString() == "ok")
                        {
                            // GameManager.getInstance().PreLoadScene("game");
                            GameManager.getInstance().LoadScene("main");
                        }
                    });
                }
            }
        );

        var _this = this;
        cc.loader.onProgress = function(curCount, totalCount, item){
            _this.progressBar.progress = curCount / totalCount;
        };
    }
});
