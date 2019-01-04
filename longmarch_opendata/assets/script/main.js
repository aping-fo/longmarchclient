var UIHelper = require("UIHelper");

var Const = {
    OpenDataKey_Step: "totalStep",
};

cc.Class({
    extends: cc.Component,

    properties: {
        //排名组件
        rankPanel:{
            type: cc.Node,
            default: null
        },

        myRankItem: {
            type: cc.Node,
            default: null
        },

        scrollView: {
            type: cc.ScrollView,
            default: null
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.m_datas = [];

        this.m_openId = "";
        this.m_nickName = "";
        this.m_avatarUrl = "";
        this.m_myStep = 0;

        var _this = this;
        wx.onMessage(function(data){
            // console.log("onMessage");
            // console.log(data);
            switch(data.eventType){
                case 0:
                    //初始化基础信息
                    if(data.openId != null){
                        _this.m_openId = data.openId;
                    }
                    break;

                case 1:
                    //打开好友排行榜
                    _this.setMyInfo(data.myInfo);
                    _this.getFriendRank();
                    break;

                case 2:
                    //刷新世界排行榜
                    _this.setMyGroupInfo(data.myGroupInfo);
                    _this.getWorldRank(data.data);
                    break;
            }
        });
    },

    start () {
    },

    update (dt) {
    },

    setMyInfo(info){
        this.myRankInfo = {
            openId: info.openId,
            nickName: info.wxName,
            avatarUrl: info.iconUrl,
            step: info.totalStep,
            index: -1
        }
    },

    setMyGroupInfo(info){
        this.myRankInfo = {
            openId: info.id,
            nickName: info.name,
            avatarUrl: info.iconUrl,
            step: info.step,
            level: 1,
            index: -1
        }
    },

    getFriendRank(){
        this.m_datas = [];

        var _this = this;
        wx.getFriendCloudStorage({
            keyList: [Const.OpenDataKey_Step],
            success: (res)=>{
                console.log("GetFriendRank success");
                _this.updateDatas(res);
                _this.updateDataItems();
            },

            fail: ()=>{
                console.log("GetFriendRank fail");
            },

            complete: ()=>{
                console.log("GetFriendRank complete");

            }
        });
    },

    getWorldRank(data){
        var datas = [];
        for(var i = 0; i < data.length; i++){
            var d = {};
            d.index = i;
            d.openId = data[i].id;
            d.step = data[i].step;
            d.nickName = data[i].name;
            d.avatarUrl = data[i].iconUrl;
            d.level = 1;

            datas[i] = d;
        }
        this.m_datas = datas;
        this.updateDataItems();
    },
    
    sortRank(v1, v2){
        var step1 = Number(v1.step);
        var step2 = Number(v2.step);

        if(step1 < step2){
            return 1;
        }else if(step1 > step2){
            return -1;
        }else{
            return 0;
        }
    },

    updateDatas(res){
        var dataLen = res.data.length;
                
        this.m_datas = [];
        for(var i = 0; i < dataLen; i++){
            var data = res.data[i];
            var kvDataList = data.KVDataList;
            var step = "0";

            for(var j = 0; j < kvDataList.length; j++){
                if(kvDataList[j].key == Const.OpenDataKey_Step){
                    step = kvDataList[j].value;
                    break;
                }
            }

            var obj = {
                nickName: data.nickname,
                avatarUrl: data.avatarUrl,
                openId: data.openid,
                step: step
            };
            this.m_datas.push(obj);
        }
        
        this.m_datas.sort(this.sortRank);

        for(var i = 0; i < this.m_datas.length; i++){
            let data = this.m_datas[i];
            data.index = i;
        }
    },

    updateDataItems(){
        var rankItems = this.rankPanel.children;

        for(var i = 0; i < rankItems.length; i++){
            rankItems[i].active = false;
        }

        for(var i = 0; i < this.m_datas.length; i++){
            var rankItem = null;

            if(i >= rankItems.length){
                rankItem = cc.instantiate(rankItems[0]);
                rankItem.setParent(this.rankPanel);
            }else{
                rankItem = rankItems[i];
            }
            
            var data = this.m_datas[i];

            rankItem.active = true;
            this.updateItem(rankItem, data);
        }
        this.updateMyDataItem();

        this.scrollView.scrollToTop();
    },

    updateMyDataItem(){
        var myData = null;

        for(var i = 0; i < this.m_datas.length; i++){
            if(this.m_openId == this.m_datas[i].openId){
                myData = this.m_datas[i];
                break;
            }
        }

        if(myData == null){
            myData = this.myRankInfo;
        }

        this.updateItem(this.myRankItem, myData);
    },

    updateItem(item, obj){
        if(obj == null){
            // item.getChildByName("lb_name").getComponent(cc.Label).string = "无";
            // item.getChildByName("avatar").active    = false;
            // item.getChildByName("lb_rank").active   = false;
            // item.getChildByName("lb_num").active    = false;
            // item.getChildByName("first").active     = false;
            // item.getChildByName("second").active    = false;
            // item.getChildByName("third").active     = false;
            // item.getChildByName("lb_rank").active   = false;
            return;
        }

        var name = obj.nickName;
        var avatarUrl = obj.avatarUrl;
        var level = obj.level;

        item.getChildByName("img_group").active = level != null;
        if(level != null){
            UIHelper.SetImageFromUrl(item.getChildByName("img_group"), "texture/" + level + "_level", false);
        }

        if(name.length > 4){
            name = name.substr(0, 4) + "…";
        }

        item.getChildByName("lb_name").getComponent(cc.Label).string = name;

        UIHelper.SetImageFromUrl(cc.find("avatar/img_avatar", item), avatarUrl);

        if(obj.index + 1 == 1){
            item.getChildByName("first").active     = true;
            item.getChildByName("second").active    = false;
            item.getChildByName("third").active     = false;
            item.getChildByName("lb_rank").active   = false;
        }else if(obj.index + 1 == 2){
            item.getChildByName("first").active     = false;
            item.getChildByName("second").active    = true;
            item.getChildByName("third").active     = false;
            item.getChildByName("lb_rank").active   = false;
        }else if(obj.index + 1 == 3){
            item.getChildByName("first").active     = false;
            item.getChildByName("second").active    = false;
            item.getChildByName("third").active     = true;
            item.getChildByName("lb_rank").active   = false;
        }else{
            item.getChildByName("first").active     = false;
            item.getChildByName("second").active    = false;
            item.getChildByName("third").active     = false;
            item.getChildByName("lb_rank").active   = true;
            if(obj.index == -1){
                item.getChildByName("lb_rank").getComponent(cc.Label).string = '无';
            }else{
                item.getChildByName("lb_rank").getComponent(cc.Label).string = obj.index + 1 + '';
            }
        }
        
        if(item.getChildByName("lb_num")){
            item.getChildByName("lb_num").getComponent(cc.Label).string = obj.step;
        }
    }
});
